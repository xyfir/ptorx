import db = require("../../lib/db");

/*
    GET api/emails
    RETURN
        { emails: [
            id: number, name: string, description: string, address: string
        ]}
    DESCRIPTION
        Returns basic information for all REDIRECT emails linked to account
*/
export = function (req, res) {

    let sql: string = `
        SELECT emails_id as id, name, description, address
        FROM redirect_emails WHERE user_id = ?
    `;
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();
        res.json({ emails: (err || !rows.length ? [] : rows) });
    }));

};