const db = require("lib/db");

/*
    POST api/account/email/:email
    RETURN
        { error: boolean, id?: number, message?: string }
    DESCRIPTION
        Adds a MAIN email to user's account
*/
module.exports = function(req, res) {

    if (req.params.email.match(/.*ptorx.com$/)) {
        res.json({
            error: true,
            message: "Cannot use Ptorx addresses to receive mail from Ptorx"
        }); return;
    }

    let sql = `
        SELECT (
            SELECT COUNT(email_id) FROM main_emails WHERE user_id = ?
        ) AS emails, (
            SELECT COUNT(email_id) FROM main_emails WHERE user_id = ? AND address = ?
        ) AS email_exists, (
            SELECT trial FROM users WHERE user_id = ?
        ) AS trial
    `, vars = [
        req.session.uid,
        req.session.uid, req.params.email,
        req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "An unknown error occured" });
        }
        else if (rows[0].emails > 0 && rows[0].trial) {
            cn.release();
            res.json({
                error: true,
                message: "Trial users cannot have more than one main email"
            });
        }
        else if (rows[0].email_exists > 0) {
            cn.release();
            res.json({
                error: true,
                message: "This email is already linked to your account"
            });
        }
        else if (req.params.email.length < 6 || req.params.email.length > 64) {
            cn.release();
            res.json({
                error: true,
                message: "Invalid email length. 6-64 characters required"
            });
        }
        else {
            const insert = {
                user_id: req.session.uid, address: req.params.email
            };
            sql = "INSERT INTO main_emails SET ?";

            cn.query(sql, insert, (err, result) => {
                cn.release();

                if (err || !result.affectedRows)
                    res.json({ error: true, message: "An error occured-" });
                else
                    res.json({ error: false, id: result.insertId });
            });
        }
    }));

};