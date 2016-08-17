const db = require("lib/db");

/*
    GET api/account
    RETURN
        {
            loggedIn: boolean, emails?: [{ id: number, address: string }],
            subscription?: number
        }
    DESCRIPTION
        Returns all MAIN emails on account and subscription expiration
*/
module.exports = function(req, res) {

    if (!req.session.uid) {
        res.json({ loggedIn: false });
        return;
    }

    let sql = `
        SELECT email_id as id, address FROM main_emails WHERE user_id = ?
    `;
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();

        res.json({
            loggedIn: true, emails: rows || [],
            subscription: req.session.subscription
        });
    }));

};