const clearCache = require("lib/email/clear-cache");
const db = require("lib/db");

/*
    DELETE api/modifiers/:mod
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a modifier
*/
module.exports = function(req, res) {

    let sql = `SELECT email_id as id FROM linked_modifiers WHERE modifier_id = ?`;
    db(cn => cn.query(sql, [req.params.mod], (err, rows) => {
        sql = "DELETE FROM modifiers WHERE modifier_id = ? AND user_id = ?";
        cn.query(sql, [req.params.mod, req.session.uid], (err, result) => {
            cn.release();

            if (err || !result.affectedRows) {
                res.json({ error: true });
            }
            else {
                rows.forEach(row => clearCache(row.id));
                res.json({ error: false });
            }
        });
    }));

};