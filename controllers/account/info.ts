import db = require("../../lib/db");

/*
    GET api/account
    RETURN
        { emails: [{ id: number, address: string }], subscription: number }
    DESCRIPTION
        Returns all MAIN emails on account and subscription expiration
*/
export = function (req, res) {

    let sql: string = `
        SELECT email_id as id, address FROM main_emails WHERE user_id = ?
    `;
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();

        if (err || !rows.length)
            res.json({ emails: [], subscription: req.session.subscription });
        else
            res.json({ emails: rows, subscription: req.session.subscription });
    }));

};