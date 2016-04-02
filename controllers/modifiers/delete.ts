import db = require("../../lib/db");

/*
    DELETE api/modifiers/:mod
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a modifier
*/
export = function (req, res) {

    let sql: string = `
        DELETE FROM modifiers WHERE modifier_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.mod, req.session.uid], (err, rows) => {
        cn.release();
        res.json({ error: !!err || !rows.length });
    }));

};