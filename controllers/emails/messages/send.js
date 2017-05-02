const db = require("lib/db");

const config = require("config");
const mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    POST api/emails/:email/messages/
    REQUIRED
        to: string, subject: string, content: string
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Sends an email from a REDIRECT email
*/
module.exports = function(req, res) {

    const sql = `
        SELECT address, (
            SELECT trial FROM users WHERE user_id = ?
        ) AS trial FROM redirect_emails
        WHERE email_id = ? AND user_id = ?
    `, vars = [
        req.session.uid,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({ error: true, message: "Email does not exist" });
        }
        else if (rows[0].trial) {
            res.json({ error: true, message: "Trial users cannot send mail" });
        }
        else {
            const data = {
                from: rows[0].address, to: req.body.to, subject: req.body.subject,
                text: req.body.content
            };

            mailgun.messages().send(data, (err, body) => {
                res.json({ error: !!err });
            });
        }
    }));

};