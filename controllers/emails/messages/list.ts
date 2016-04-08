import db = require("../../../lib/db");

/*
    GET api/emails/:email/messages
    RETURN
        { messages: [{ id: string, received: number, subject: string }] }
    DESCRIPTION
        Return basic data on any stored messages for email
*/
export = function (req, res) {

    let sql: string = `
        SELECT message_id as id, received, subject FROM messages
        WHERE email_id IN (
            SELECT email_id FROM redirect_emails WHERE email_id = ? AND user_id = ?
        ) AND (received + 255600) > UNIX_TIMESTAMP()
    `;

    db(cn => cn.query(sql, [req.params.email, req.session.uid], (err, rows) => {
        cn.release();
        
        res.json({ messages: (err || !rows.length) ? [] : rows });
    }));

};