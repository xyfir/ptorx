import db = require("../../../lib/db");

let config = require("../../../config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "mail.ptorx.com"
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
export = function (req, res) {

    if (Date.now() > req.session.subscription) {
        res.json({ error: true, message: "Free members cannot send emails from Ptorx" });
        return;
    }

    let sql: string = `SELECT address FROM redirect_emails WHERE email_id = ? AND user_id = ?`;

    db(cn => cn.query(sql, [req.params.email, req.session.uid], (err, rows) => {
        cn.release();

        if (err || !rows.length) {
            res.json({ error: true, message: "Email does not exist" });
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