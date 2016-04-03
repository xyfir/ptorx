import db = require("../../lib/db");

/*
    DELETE api/filters/:filter
    RETURN
        { error: boolean }
    DESCRIPTION
        Deletes a filter
*/
export = function (req, res) {

    let sql: string = `
        DELETE FROM filters WHERE filter_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {
        cn.release();
        res.json({ error: !!err || !rows.length });
    }));

};