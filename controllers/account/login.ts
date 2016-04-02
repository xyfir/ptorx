import * as request from "request";
import db = require("../../lib/db");

/*
    POST api/account/login
    REQUIRED
        xid: string, auth: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Register or login user
*/
export = function (req, res) {

    let url: string = require("../../config").addresses.xacc
        + `api/service/13/${req.body.xid}/${req.body.auth}`;

    request(url, (err, response, body) => {
        body = JSON.parse(body);

        if (body.error) {
            res.json({ error: true });
            return;
        }

        let sql: string = `
            SELECT user_id, subscription, xadid FROM users WHERE xyfir_id = ?
        `;
        db(cn => cn.query(sql, [], (err, rows) => {
            // First login
            if (!rows.length) {
                let insert = {
                    xyfir_id: req.body.xid, email: body.email, xadid: body.xadid
                };
                sql = "INSERT INTO users SET ?";
                cn.query(sql, insert, (err, result) => {
                    cn.release();

                    if (err || !result.affectedRows) {
                        res.json({ error: true });
                    }
                    else {
                        req.session.uid = result.insertId;
                        req.session.xadid = body.xadid;
                        req.session.subscription = 0;

                        res.json({ error: false });
                    }
                });
            }
            // Update data
            else {
                sql = "UPDATE users SET email = ? WHERE user_id = ?"
                cn.query(sql, [body.email, rows[0].user_id], (err, result) => {
                    cn.release();

                    if (err) {
                        res.json({ error: true });
                    }
                    else {
                        req.session.uid = rows[0].user_id;
                        req.session.xadid = rows[0].xadid;
                        req.session.subscription = rows[0].subscription;

                        res.json({ error: false });
                    }
                });
            }
        }));
    });

};