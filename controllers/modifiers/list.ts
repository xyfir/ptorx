import db = require("../../lib/db");

/*
    GET api/modifiers
    RETURN
        { modifiers: [
            id: number, name: string, description: string, type: number
        ]}
    DESCRIPTION
        Returns basic information for all modifiers linked to account
*/
export = function (req, res) {

    let sql: string = `
        SELECT modifier_id as id, name, description, type
        FROM modifiers WHERE user_id = ? 
    `;
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();
        res.json({ modifiers: (err || !rows.length ? [] : rows) });
    }));

};