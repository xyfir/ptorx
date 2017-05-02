const validateModifiers = require("lib/email/validate-modifiers");
const buildExpression = require("lib/mg-route/build-expression");
const validateFilters = require("lib/email/validate-filters");
const buildAction = require("lib/mg-route/build-action");
const validate = require("lib/email/validate");
const generate = require("lib/email/generate");
const request = require("request");
const db = require("lib/db");

const config = require("config");
const mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    POST api/emails
    REQUIRED
        name: string, description: string, address: string, filters: string,
        modifiers: string, to: number
    OPTIONAL
        saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean,
        recaptcha: string
    RETURN
        { error: boolean, message?: string, id?: number }
    DESCRIPTION
        Creates a redirect email, its MailGun inbound route, any used links filters/modifiers
*/
module.exports = function(req, res) {

    const response = validate(req.body, req.session.subscription);

    if (response !== "ok") {
        res.json({ error: true, message: response });
        return;
    }

    let sql = "", vars = [], error = "";

    db(cn => {
        /* Get data / more validation */
        const step1 = () => {
            sql = `
                SELECT emails_created, subscription, trial, (
                    SELECT COUNT(email_id) FROM redirect_emails
                    WHERE user_id = ? AND created >= CURDATE()
                ) AS emails_created_today
                FROM users WHERE user_id = ?
            `, vars = [
                req.session.uid,
                req.session.uid
            ];
            
            cn.query(sql, vars, (err, rows) => {
                if (err || !rows.length) {
                    error = "An unknown error occured-";
                }
                else if (Date.now() > rows[0].subscription) {
                    error = "You do not have a subscription";
                }
                else if (rows[0].trial) {
                    if (rows[0].emails_created_today >= 5)
                        error = "Trial users can only create 5 emails per day";
                    else if (rows[0].emails_created >= 15)
                        error = "Trial users can only create 15 emails total";
                }
                else if (rows[0].emails_created_today >= 20) {
                    error = "You can only create up to 20 emails per day.";
                }
                
                if (error) {
                    res.json({ error: true, message: error });
                }
                // Validate captcha
                else if (rows[0].trial) {
                    request.post({
                        url: "https://www.google.com/recaptcha/api/siteverify",
                        form: {
                            secret: config.keys.recaptcha,
                            response: req.body.recaptcha,
                            remoteip: req.ip
                        }
                    }, (e, r, body) => {
                        if (e || !JSON.parse(body).success) {
                            res.json({
                                error: true, message: "Invalid captcha"
                            });
                        }
                        else {
                            step2();
                        }
                    });
                }
                else step2();
            });
        }

        /* Generate address OR check if user provided exists */
        const step2 = () => {
            // Generate an address
            if (req.body.address == '') {
                generate(cn, step3);
            }
            // Make sure address exists
            else {
                sql = `
                    SELECT email_id FROM redirect_emails WHERE address = ?
                `, vars = [
                    req.body.address
                ];

                cn.query(sql, vars, (err, rows) => {
                    if (err || !!rows.length) {
                        cn.release();
                        res.json({
                            error: true,
                            message: "That email address is already in use"
                        });
                    }
                    else {
                        step3(req.body.address);
                    }
                });
            }
        };

        /* Finish validation */
        const step3 = (email) => {
            sql = `
                SELECT email_id FROM main_emails
                WHERE email_id = ? AND user_id = ?
            `, vars = [
                req.body.to, req.session.uid
            ];

            cn.query(sql, vars, (err, rows) => {
                if (err) {
                    cn.release();
                    res.json({
                        error: true, message: "An unknown error occured"
                    });
                }
                // 'To' email exists or user is not using a 'to' address
                else if (!!+req.body.noToAddress || rows.length) {
                    // Build insert data object
                    const data = {
                        to_email: (rows.length ? rows[0].email_id : 0),
                        spam_filter: !+req.body.noSpamFilter,
                        name: req.body.name, address: email,
                        description: req.body.description,
                        save_mail: !!+req.body.saveMail,
                        user_id: req.session.uid
                    };

                    const modifiers = req.body.modifiers.split(',');
                    const filters = req.body.filters.split(',')

                    validateFilters(filters, req, cn, (err, msg) => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: msg });
                        }
                        else {
                            validateModifiers(modifiers, req, cn, (err, msg) => {
                                if (err) {
                                    cn.release();
                                    res.json({ error: true, message: msg });
                                }
                                else {
                                    step4(data, filters, modifiers);
                                }
                            });
                        }
                    });
                }
                else {
                    cn.release();
                    res.json({
                        error: true, message: "Could not find main email"
                    });
                }
            });
        };

        /* Create email and MailGun route */
        const step4 = (data, filters, modifiers) => {
            // Insert email
            sql = "INSERT INTO redirect_emails SET ?";

            cn.query(sql, data, (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({
                        error: true, message: "An unknown error occured--"
                    }); return;
                }

                const id = result.insertId;

                // Build MailGun route expression(s)
                buildExpression({
                    address: data.address, filters,
                    saveMail: data.save_mail || data.to_email == 0
                }, cn, (expression) => {
                    mailgun.routes().create({
                        priority: (data.spam_filter ? 2 : 0), description: "",
                        expression, action: buildAction(
                            id, data.to_email == 0 || data.save_mail
                        )
                    }, (err, body) => {
                        if (err) {
                            cn.release();
                            res.json({
                                error: true,
                                message: "An unknown error occured---"
                            });
                        }
                        else {
                            // Save MailGun route ID to redirect_emails where email
                            sql = `
                                UPDATE redirect_emails SET mg_route_id = ?
                                WHERE email_id = ?
                            `, vars = [
                                body.route.id,
                                id
                            ];

                            cn.query(sql, vars, (err, result) => {
                                step5(id, filters, modifiers);
                            });
                        }
                    });
                });
            });
        };

        /* Create entries in linked_modifiers|filters */
        const step5 = (emailId, filters, modifiers) => {
            res.json({ error: false, id: emailId });

            sql = "INSERT INTO linked_filters (filter_id, email_id) VALUES "
                + filters.map(f => `('${+f}', '${+emailId}')`).join(", ");

            cn.query(sql, () => {
                sql = `
                    INSERT INTO linked_modifiers
                    (modifier_id, email_id, order_number) VALUES 
                ` + modifiers.map((m, i) =>
                    `('${+m}', '${+emailId}', '${i}')`
                ).join(", ");

                cn.query(sql, () => {
                    sql = `
                        UPDATE users SET emails_created = emails_created + 1
                        WHERE user_id = ?
                    `, vars = [
                        req.session.uid
                    ];
                    
                    cn.query(sql, vars, () => cn.release());
                });
            });
        };

        step1();
    });

};