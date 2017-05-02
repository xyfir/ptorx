const clearCache = require("lib/email/clear-cache");
const buildData = require("lib/modifier/build-data");
const validate = require("lib/modifier/validate");
const db = require("lib/db");

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
        { error: boolean, message: string }
    DESCRIPTION
        Update a modifier's data
*/
module.exports = function(req, res) {

    let response = validate(req.body);

    if (response != "ok") {
        res.json({ error: true, message: response });
        return;
    }

    let sql = `
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
            res.json({ error: true, message: "An unknown error occured" });
        }
        else {
            res.json({ error: false, message: "" });

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