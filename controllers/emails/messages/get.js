const db = require("lib/db");

let config  = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "mail.ptorx.com"
});

/*
    GET api/emails/:email/messages/:message
    RETURN
        {
            error: boolean, headers?: [[ header, value ]],
            from?: string, subject?: string, text?: string, html?: string
        }
    DESCRIPTION
        Return message content
*/
module.exports = function(req, res) {
    
    let sql = `
        SELECT message_key as mkey FROM messages WHERE message_id = ? AND email_id IN (
            SELECT email_id FROM redirect_emails WHERE email_id = ? AND user_id = ?
        ) AND received + 255600 > UNIX_TIMESTAMP()
    `;
    let vars = [
        req.params.message,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            mailgun.messages(rows[0].mkey).info((err, data) => {
                if (err) {
                    res.json({ error: true });
                }
                else {
                    res.json({
                        error: false, headers: data["message-headers"], from: data["from"],
                        subject: data["subject"], text: data["body-plain"],
                        html: data["body-html"]
                    });
                }
            });
        }
    }));

};