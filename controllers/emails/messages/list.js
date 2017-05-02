const db = require("lib/db");

/*
    GET api/emails/:email/messages
    OPTIONAL
        rejected: boolean
    RETURN
        { messages: [{ id: string, received: number, subject: string }] }
    DESCRIPTION
        Return basic data on any stored messages for :email
        Returns accepted or rejected messages based on req.query.rejected
*/
module.exports = function(req, res) {

    const sql = `
        SELECT
            m.message_key as id, m.received, m.subject
        FROM
            messages AS m, redirect_emails AS re
        WHERE
            m.email_id = re.email_id AND m.rejected = ?
            AND m.received + 255600 > UNIX_TIMESTAMP()
            AND re.email_id = ? AND re.user_id = ?
    `, vars = [
        !!+req.query.rejected,
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        cn.release();
        res.json({ messages: (err || !rows.length) ? [] : rows });
    }));

};