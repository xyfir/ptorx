const db = require("lib/db");

const config = require("config");
const mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
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
module.exports = function(req, res) {

    // Get message_key and address
    const sql = `
        SELECT address, (
            SELECT message_key FROM messages
            WHERE message_key = ? AND email_id = ?
        ) AS mkey, (
            SELECT trial FROM users WHERE user_id = ?
        ) AS trial FROM redirect_emails
        WHERE email_id = ? AND user_id = ?
    `, vars = [
        req.params.message, req.params.email,
        req.session.uid,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();
        
        if (err || !rows.length) {
            res.json({ error: true, message: "Message does not exist" });
        }
        else if (rows[0].trial) {
            res.json({
                error: true, message: "Trial users cannot reply to mail"
            });
        }
        else {
            // Get original messages' data
            mailgun.messages(rows[0].mkey).info((err, data) => {
                if (err) {
                    res.json({
                        error: true, message: "An unknown error occured"
                    });
                }
                else {
                    data = {
                        from: rows[0].address, to: data.sender,
                        text: req.body.content, subject: "Re: " + data.subject
                    };

                    // Send reply
                    mailgun.messages().send(data, (err, body) => {
                        if (err) {
                            res.json({
                                error: true, message: "An unknown error occured"
                            });
                        }
                        else {
                            res.json({ error: false });
                        }
                    });
                }
            });
        }
    }));

};