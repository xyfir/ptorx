const db = require("lib/db");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    DELETE api/emails/:email/messages/:message
    RETURN
        { error: boolean }
    DESCRIPTION
        Delete message from Ptorx and MailGun
*/
module.exports = function(req, res) {

    // Make sure message exists and user has access
    let sql = `
        SELECT message_key as mkey FROM messages
        WHERE message_key = ? AND email_id IN (
            SELECT email_id FROM redirect_emails
            WHERE email_id = ? AND user_id = ?
        )
    `, vars = [
        req.params.message,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            // Delete message ref from Ptorx
            sql = `
                DELETE FROM messages WHERE message_key = ? AND email_id = ?
            `, vars = [
                req.params.message, req.params.email
            ];

            cn.query(sql, vars, (err, result) => {
                cn.release();

                if (err || !result.affectedRows) {
                    res.json({ error: true });
                }
                else {
                    // Delete from MailGun
                    mailgun.messages(rows[0].mkey).delete(() => {});
                    res.json({ error: false });
                }
            });
        }
    }));

};