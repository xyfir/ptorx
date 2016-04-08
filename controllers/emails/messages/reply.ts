import db = require("../../../lib/db");

let config = require("../../../config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "mail.ptorx.com"
});

/*
    POST api/emails/:email/messages/:message
    REQUIRED
        content: string
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Send reply to a stored message
*/
export = function (req, res) {

    if (Date.now() > req.session.subscription) {
        res.json({ error: true, message: "Free members cannot send replies from Ptorx" });
        return;
    }

    // Get message_key and address
    let sql: string = `
        SELECT address, (
            SELECT message_key FROM messages WHERE message_id = ? AND email_id = ?
        ) as mkey FROM redirect_emails WHERE email_id = ? AND user_id = ?
    `;
    let vars = [
        req.params.message, req.params.email,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();
        
        if (err || !rows.length) {
            res.json({ error: true, message: "Message does not exist" });
        }
        else {
            // Get original messages' data
            mailgun.messages(rows[0].mkey).info((err, data) => {
                if (err) {
                    res.json({ error: true, message: "An unknown error occured" });
                }
                else {
                    data = {
                        from: rows[0].address, to: data.sender, text: req.body.content,
                        subject: "RE: " + data.subject,
                    };

                    // Send reply
                    mailgun.messages().send(data, (err, body) => {
                        if (err)
                            res.json({ error: true, message: "An unknown error occured" });
                        else
                            res.json({ error: false });
                    });
                }
            });
        }
    }));

};