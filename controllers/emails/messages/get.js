const request = require("request");
const db = require("lib/db");

const config  = require("config");

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
        SELECT message_key as mkey FROM messages
        WHERE message_key = ? AND email_id IN (
            SELECT email_id FROM redirect_emails
            WHERE email_id = ? AND user_id = ?
        ) AND received + 255600 > UNIX_TIMESTAMP()
    `, vars = [
        req.params.message,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            // mailgun-js gives error when loading message
            const url = "https://api:" + config.keys.mailgun
                + "@se.api.mailgun.net/v3/domains/" + "ptorx.com"
                + "/messages/" + req.params.message;

            request.get(url, (err, response, body) => {
                if (err) {
                    res.json({ error: true });
                }
                else {
                    body = JSON.parse(body);

                    res.json({
                        text: body["body-plain"], html: body["body-html"],
                        error: false, headers: body["message-headers"],
                        from: body["from"], subject: body["subject"]
                    });
                }
            });
        }
    }));

};