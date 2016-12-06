const validateModifiers = require("lib/email/validate-modifiers");
const buildExpression = require("lib/mg-route/build-expression");
const validateFilters = require("lib/email/validate-filters");
const buildAction = require("lib/mg-route/build-action");
const validate = require("lib/email/validate");
const generate = require("lib/email/generate");
const db = require("lib/db");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    POST api/emails
    REQUIRED
        name: string, description: string, address: string, filters: string,
        modifiers: string, to: number
    OPTIONAL
        saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean
    RETURN
        { error: boolean, message?: string, id?: number }
    DESCRIPTION
        Creates a redirect email, a its MailGun inbound route, any used links filters/modifiers
*/
module.exports = function(req, res) {

    let response = validate(req.body, req.session.subscription);

    if (response !== "ok") {
        res.json({ error: true, message: response });
        return;
    }

    let sql = "";

    db(cn => {
        /* Generate address OR check if user provided exists */
        const step1 = () => {
            // Generate an address
            if (req.body.address == '') {
                // Free members limited to 20 redirect emails
                if (Date.now() > req.session.subscription) {
                    sql = "SELECT COUNT(email_id) as emails FROM redirect_emails WHERE user_id = ?";
                    cn.query(sql, [req.session.uid], (err, rows) => {
                        if (rows[0].emails >= 20) {
                            cn.release();
                            res.json({ error: true, message: "Free members limited to 20 redirect emails" });
                        }
                        else {
                            generate(cn, step2);
                        }
                    });
                }
                else {
                    generate(cn, step2);
                }
            }
            // Make sure address exists
            else {
                sql = "SELECT email_id FROM redirect_emails WHERE address = ?";
                cn.query(sql, [req.body.address], (err, rows) => {
                    if (!!rows.length) {
                        cn.release();
                        res.json({ error: true, message: "That email address is already in use" });
                    }
                    else {
                        step2(req.body.address);
                    }
                });
            }
        };

        /* Finish validation */
        const step2 = (email) => {
            sql = "SELECT email_id FROM main_emails WHERE email_id = ? AND user_id = ?";
            cn.query(sql, [req.body.to, req.session.uid], (err, rows) => {
                // To email exists or user is allowed to use no to address
                if (!rows.length && !!(+req.body.noToAddress) || !!rows.length) {
                    // Build insert data object
                    let data = {
                        description: req.body.description, to_email: rows[0].email_id || 0,
                        address: email, user_id: req.session.uid, name: req.body.name,
                        spam_filter: !(+req.body.noSpamFilter),
                        save_mail: !!(+req.body.saveMail)
                    };

                    let modifiers = req.body.modifiers.split(',');
                    let filters = req.body.filters.split(',')

                    validateFilters(filters, req, cn, (err, message) => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message });
                        }
                        else {
                            validateModifiers(modifiers, req, cn, (err, message) => {
                                if (err) {
                                    cn.release();
                                    res.json({ error: true, message });
                                }
                                else {
                                    step3(data, filters, modifiers);
                                }
                            });
                        }
                    });
                }
                else {
                    cn.release();
                    res.json({ error: true, message: "Could not find main email" });
                }
            });
        };

        /* Create email and MailGun route */
        const step3 = (data, filters, modifiers) => {
            // Insert email
            sql = "INSERT INTO redirect_emails SET ?";
            cn.query(sql, data, (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured" });
                    return;
                }

                let url = require("config").addresses.mailgun;
                let id = result.insertId;

                // Build MailGun route expression(s)
                buildExpression({
                    address: data.address, filters, saveMail: data.save_mail
                }, cn, (expression) => {
                    mailgun.routes().create({
                        priority: (data.spam_filter ? 2 : 0), description: "",
                        expression, action: buildAction(
                            id, req.session.subscription,
                            data.to_email == 0 || data.save_mail
                        )
                    }, (err, body) => {
                        if (err) {
                            cn.release();
                            res.json({ error: true, message: "An unknown error occured" });
                        }
                        else {
                            // Save MailGun route ID to redirect_emails where email
                            sql = "UPDATE redirect_emails SET mg_route_id = ? WHERE email_id = ?";
                            cn.query(sql, [body.route.id, id], (err, result) => {
                                step4(id, filters, modifiers);
                            });
                        }
                    });
                });
            });
        };

        /* Create entries in linked_modifiers|filters */
        const step4 = (emailId, filters, modifiers) => {
            sql = "INSERT INTO linked_filters (filter_id, email_id) VALUES ";
            filters.forEach(filter => sql += `('${+filter}', '${+emailId}'), `);

            cn.query(sql.substr(0, sql.length - 2), (err, result) => {
                sql = "INSERT INTO linked_modifiers (modifier_id, email_id) VALUES ";
                modifiers.forEach(modifier => sql += `('${+modifier}', '${+emailId}'), `);

                cn.query(sql.substr(0, sql.length - 2), (err, result) => {
                    cn.release();

                    res.json({ error: false, id: emailId });
                });
            });
        };

        step1();
    });

};