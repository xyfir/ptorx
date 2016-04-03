import db = require("../../lib/db");

/*
    GET api/filters
    RETURN
        { filters: [
            id: number, name: string, description: string, type: number
        ]}
    DESCRIPTION
        Returns basic information for all filters linked to account
*/
export = function (req, res) {

    let sql: string = `
        SELECT filter_id as id, name, description, type
        FROM filters WHERE user_id = ? 
    `;
    db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
        cn.release();
        res.json({ modifiers: (err || !rows.length ? [] : rows) });
    }));

};