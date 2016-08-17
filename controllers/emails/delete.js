const clearCache = require("lib/email/clear-cache");
const db = require("lib/db");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    DELETE api/emails/:email
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a redirect email, its MailGun route, and any entries in linked_modifiers|filters
*/
module.exports = function(req, res) {

    let sql = `
        SELECT mg_route_id as route FROM redirect_emails WHERE email_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.email, req.session.uid], (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true });
        }
        else {
            sql = `
                UPDATE redirect_emails SET user_id = 0, to_email = 0, name = '',
                description = '', mg_route_id = '' WHERE email_id = ?
            `;

            cn.query(sql, [req.params.email], (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({ error: true });
                }
                else {
                    clearCache(req.params.email);
                    mailgun.routes(rows[0].route).delete((err, body) => {});

                    res.json({ error: false });

                    sql = "DELETE FROM linked_filters WHERE email_id = ?";
                    cn.query(sql, [req.params.email], (err, result) => {
                        sql = "DELETE FROM linked_modifiers WHERE emails_id = ?"
                        cn.query(sql, [req.params.email], (err, result) => {
                            cn.release();
                        });
                    });
                }
            });
        }
    }));

};