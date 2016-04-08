import db = require("../../../lib/db");

let config = require("../../../config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "mail.ptorx.com"
});

/*
    DELETE api/emails/:email/messages/:message
    RETURN
        { error: boolean }
    DESCRIPTION
        Delete message from Ptorx and MailGun
*/
export = function (req, res) {

    // Make sure message exists and user has access
    let sql: string = `
        SELECT message_key as mkey FROM messages WHERE message_id = ? AND email_id IN (
            SELECT email_id FROM redirect_emails WHERE email_id = ? AND user_id = ?
        )
    `;
    let vars = [
        req.params.message,
        req.params.email, req.sesion.uid
    ];

    db(cn => cn.query(sql, [req.params.email, req.sesion.uid], (err, rows) => {
        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            // Delete message ref from Ptorx
            sql = `DELETE FROM messages WHERE message_id = ? AND email_id = ?`;

            cn.query(sql, [req.params.message, req.params.email], (err, result) => {
                cn.release();

                if (err || !result.affectedRows) {
                    res.json({ error: true });
                }
                else {
                    // Delete from MailGun
                    mailgun.messages(rows[0].mkey).delete(function(){});
                    res.json({ error: false });
                }
            });
        }
    }));

};