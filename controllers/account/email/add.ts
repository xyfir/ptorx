import db = require("../../../lib/db");

/*
    POST api/account/email/:email
    RETURN
        { error: boolean, id?: number, message?: string }
    DESCRIPTION
        Adds a MAIN email to user's account
*/
export = function (req, res) {

    if (req.params.email.match(/.*ptorx.com$/)) {
        res.json({ error: true, message: "Cannot use Ptorx addresses to receive mail from Ptorx" });
        return;
    }

    let sql: string = `
        SELECT (
            SELECT COUNT(email_id) FROM main_emails WHERE user_id = ?
        ) as emails, (
            SELECT COUNT(email_id) FROM main_emails WHERE user_id = ? AND address = ?
        ) as email_exists
    `;
    let vars = [
        req.session.uid,
        req.session.uid, req.params.email
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "An unknown error occured" });
        }
        else if (rows[0].emails > 0 && Date.now() > req.session.subscription) {
            cn.release();
            res.json({ error: true, message: "Free members cannot have more than one main email" });
        }
        else if (rows[0].email_exists > 0) {
            cn.release();
            res.json({ error: true, message: "This email is already linked to your account" });
        }
        else if (req.params.email.length < 6 || req.params.email.length > 64) {
            cn.release();
            res.json({ error: true, message: "Invalid email length. 6-64 characters required" });
        }
        else {
            let insert = {
                user_id: req.session.uid, address: req.params.email
            };
            sql = "INSERT INTO main_emails SET ?";

            cn.query(sql, insert, (err, result) => {
                cn.release();

                if (err || !result.affectedRows)
                    res.json({ error: true, message: "An unknown error occured-" });
                else
                    res.json({ error: false, id: result.insertId });
            });
        }
    }));

};