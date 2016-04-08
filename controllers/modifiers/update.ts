import clearCache = require("../../lib/email/clear-cache");
import buildData = require("../../lib/modifier/build-data");
import isValid = require("../../lib/modifier/is-valid");
import db = require("../../lib/db");

/*
    PUT api/modifiers/:mod
    REQUIRED
        type: number, name: string, description: string
    OPTIONAL
        ENCRYPT
            key: string
        REPLACE
            value: string, with: string, regex: boolean
        TAG
            prepend: string, value: string
        SUBJECT
            subject: string
    RETURN
        { error: boolean }
    DESCRIPTION
        Update a modifier's data
*/
export = function (req, res) {

    if (!isValid(req.body)) {
        res.json({ error: true });
        return;
    }

    let sql: string = `
        UPDATE modifiers SET name = ?, description = ?, type = ?, data = ?
        WHERE modifier_id = ? AND user_id = ?
    `;
    let vars = [
        req.body.name, req.body.description, req.body.type, buildData(req.body),
        req.params.mod, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, result) => {
        if (err || !result.affectedRows) {
            cn.release();
            res.json({ error: true });
        }
        else {
            res.json({ error: false });

            sql = "SELECT email_id as id FROM linked_modifiers WHERE modifier_id = ?";
            cn.query(sql, [req.params.mod], (err, rows) => {
                cn.release();

                if (!rows.length) {
                    rows.forEach(row => { clearCache(row.id); });
                }
            });
        }
    }));

};