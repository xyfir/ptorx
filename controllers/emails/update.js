const validateModifiers = require("lib/email/validate-modifiers");
const buildExpression = require("lib/mg-route/build-expression");
const validateFilters = require("lib/email/validate-filters");
const buildAction = require("lib/mg-route/build-action");
const clearCache = require("lib/email/clear-cache");
const validate = require("lib/email/validate");
const db = require("lib/db");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    PUT api/emails/:email
    REQUIRED
        name: string, description: string, filters: string,
        modifiers: string, to: number
    OPTIONAL
        saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Updates a redirect email, linked entries, and MailGun route
*/
module.exports = function(req, res) {

    let response = validate(req.body, req.session.subscription);

    if (response !== "ok") {
        res.json({ error: true, message: response });
        return;
    }

    let sql = "", vars = [];

    db(cn => {
        /* Extended Validation */
        const step1 = () => {
            sql = `
                SELECT mg_route_id as mgRouteId, address, (
                    SELECT COUNT(email_id) FROM main_emails
                    WHERE email_id = ? AND user_id = ?
                ) as toEmail FROM redirect_emails
                WHERE email_id = ? AND user_id = ?
            `, vars = [
                req.body.to, req.session.uid,
                req.params.email, req.session.uid
            ];

            cn.query(sql, vars, (err, rows) => {
                // toEmail doesn't exist and user didn't provide noToAddress
                if (!rows[0].toEmail && !(+req.body.noToAddress)) {
                    cn.release();
                    res.json({
                        error: true, message: "Could not find main email"
                    });
                }
                // Redirect email doesn't exist
                else if (rows[0].address == null) {
                    cn.release();
                    res.json({
                        error: true, message: "Could not find redirect email"
                    });
                }
                // Validate filters and modifiers
                else {
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
                                    step2({
                                        address: rows[0].address,
                                        routeId: rows[0].mgRouteId,
                                        filters, modifiers
                                    });
                                }
                            });
                        }
                    });
                }
            });
        };

        /* Update Email and MailGun Route */
        const step2 = (data) => {
            // Update values in redirect_emails
            sql = `
                UPDATE redirect_emails SET to_email = ?, name = ?, description = ?,
                save_mail = ?, spam_filter = ? WHERE email_id = ?
            `, vars = [
                req.body.to, req.body.name, req.body.description,
                !!(+req.body.saveMail), !(+req.body.noSpamFilter), req.params.email
            ];

            cn.query(sql, vars, (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({
                        error: true, message: "An unknown error occured"
                    }); return;
                }

                // Build MailGun route expression(s)
                buildExpression({
                    address: data.address, filters: data.filters,
                    saveMail: !!(+req.body.saveMail)
                }, cn, (expression) => {
                    // Update MailGun route
                    mailgun.routes(data.routeId).update({
                        priority: (!(+req.body.noSpamFilter) ? 2 : 0),
                        description: "", expression,
                        action: buildAction(
                            req.params.email, req.session.subscription,
                            data.to_email == 0 || data.save_mail
                        )
                    }, (err, body) => {
                        if (err) {
                            cn.release();
                            res.json({
                                error: true, message: "An unknown error occured"
                            });
                        }
                        else {
                            step3(data.filters, data.modifiers);
                        }
                    });
                });
            });
        };

        /* Create entries in linked_modifiers|filters */
        const step3 = (filters, modifiers) => {
            // Filters already linked will not be inserted twice due to unique constraint
            sql = "INSERT INTO linked_filters (filter_id, email_id) VALUES ";
            filters.forEach(filter => {
                sql += `('${+filter}', '${+req.params.email}'), `;
            });

            cn.query(sql.substr(0, sql.length - 2), (err, result) => {
                // Delete all modifiers since the order may have changed
                sql = `
                    DELETE FROM linked_modifiers WHERE email_id = ?
                `, vars = [
                    req.params.email
                ];

                cn.query(sql, vars, (err, result) => {
                    // Insert modifiers
                    sql = `
                        INSERT INTO linked_modifiers
                        (modifier_id, email_id, order_number) VALUES 
                    `;
                    modifiers.forEach((modifier, i) => {
                        sql += `('${+modifier}', '${+req.params.email}', '${i}'), `
                    });

                    cn.query(sql.substr(0, sql.length - 2), (err, result) => {
                        // Filters that have been removed will be deleted via NOT IN (...)
                        sql = `
                            DELETE FROM linked_filters
                            WHERE email_id = ? AND filter_id NOT IN (?)
                        `, vars = [
                            req.params.email, filters
                        ];

                        cn.query(sql, vars, (err, result) => {
                            cn.release();
                            clearCache(req.params.email);
                            res.json({ error: false });
                        });
                    });
                });
            });
        };

        step1();
    });

};