import clearCache = require("../../lib/email/clear-cache");
import db = require("../../lib/db");

let config = require("../../../config");
let mailgun = require("mailgun-js")({
    api_key: config.keys.mailgun, domain: "mail.ptorx.com"
});

/*
    DELETE api/emails/:email
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a redirect email, its MailGun route, and any entries in linked_modifiers|filters
*/
export = function (req, res) {

    let sql: string = `
        SELECT mg_route_id as route FROM redirect_emails WHERE email_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.email, req.session.uid], (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true });
        }
        else {
            sql = `
                DELETE FROM redirect_emails WHERE email_id = ?
            `;
            cn.query(sql, [req.params.email], (err, result) => {
                cn.release();

                if (err || !result.affectedRows) {
                    res.json({ error: true });
                    return;
                }

                clearCache(req.params.email);
                mailgun.routes(rows[0].route).delete(function(){});

                res.json({ error: false });
            });
        }
    }));

};