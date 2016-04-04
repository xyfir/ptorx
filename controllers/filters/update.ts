import escapeRegExp = require("escape-string-regexp");
import isValid = require("../../lib/filter/is-valid");
import db = require("../../lib/db");

/*
    PUT api/filters/:filter
    REQUIRED
        type: number, name: string, description: string, find: string
    OPTIONAL
        acceptOnMatch: boolean, useRegex: boolean
    RETURN
        { error: boolean, update?: number[] }
    DESCRIPTION
        Update a filter's data
*/
export = function (req, res) {

    if (!isValid(req.body)) {
        res.json({ error: true });
        return;
    }

    if (!req.body.useRegex)
        req.body.find = escapeRegExp(req.body.find);

    let sql: string = `
        UPDATE filters SET name = ?, description = ?, type = ?, find = ?,
        accept_on_match = ?, use_regex = ?
        WHERE filter_id = ? AND user_id = ?
    `;
    let vars = [
        req.body.name, req.body.description, req.body.type, req.body.find,
        !!(+req.body.acceptOnMatch), !!(+req.body.useRegex),
        req.params.filter, req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, result) => {
        if (err || !result.affectedRows) {
            cn.release();
            res.json({ error: true });
        }
        // Determine if MailGun routes need to be updated
        else if ([1, 2, 3, 6].indexOf(req.body.type) && req.body.acceptOnMatch) {
            sql = `SELECT email_id as id FROM linked_filters WHERE filter_id = ?`;
            cn.query(sql, [req.params.filter], (err, rows) => {
                cn.release();

                if (err || !rows.length)
                    res.json({ error: false });
                else
                    res.json({ error: false, update: rows.map(email => { return email.id; }) });
            });
        }
        else {
            cn.release();
            res.json({ error: false })
        }
    }));

};