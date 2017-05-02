const db = require("lib/db");

/*
    DELETE api/account/email/:email
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a MAIN email from user's account
*/
module.exports = function(req, res) {

    let sql = `
        DELETE FROM main_emails WHERE email_id = ? AND user_id = ?
    `;
    let vars = [
        req.params.email, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();
        res.json({ error: !!err || !result.affectedRows });
    }));

};