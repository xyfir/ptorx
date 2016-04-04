import isValid = require("../../lib/filter/is-valid");
import db = require("../../lib/db");

/*
    PUT api/filters/:filter
    REQUIRED
        type: number, name: string, description: string, find: string
    OPTIONAL
        acceptOnMatch: boolean, useRegex: boolean
    RETURN
        { error: boolean }
    DESCRIPTION
        Update a filter's data
*/
export = function (req, res) {

    if (!isValid(req.body)) {
        res.json({ error: true });
        return;
    }

    let sql: string = `
        UPDATE filters SET name = ?, description = ?, type = ?, find = ?,
        accept_on_match = ?, use_regex = ?
        WHERE filter_id = ? AND user_id = ?
    `;
    let vars = [
        req.body.name, req.body.description, req.body.type, req.body.find,
        req.body.acceptOnMatch, req.body.useRegex,
        req.params.filter, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, result) => {
        cn.release();

        if (err || !result.affectedRows)
            res.json({ error: true });
        else
            res.json({ error: false });
    }));

};