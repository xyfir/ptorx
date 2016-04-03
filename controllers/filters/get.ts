import db = require("../../lib/db");

/*
    GET api/filters/:filter
    RETURN
        {
            error: boolean, find: string, acceptOnMatch: boolean,
            regex: boolean, linkedTo: [{ id, address }]
        }
    DESCRIPTION
        Returns data for a specific filter
*/
export = function (req, res) {

    let sql: string = `
        SELECT find, accept_on_match as acceptOnMatch, use_regex as regex
        FROM filters WHERE filter_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {

        let response = {
            error: true, find: "", linkedTo: [], acceptOnMatch: false, regex: false
        };

        if (err || !rows.length) {
            cn.release();
            res.json(response);
        }
        else {
            response.error = false;
            response.find = rows[0].find;
            response.regex = !!(+rows[0].regex);
            response.acceptOnMatch = !!(+rows[0].acceptOnMatch);

            sql = `
                SELECT address, email_id as id FROM redirect_emails WHERE email_id IN (
                    SELECT email_id FROM linked_filters WHERE filter_id = ?
                )
            `;
            cn.query(sql, [req.params.filter], (err, rows) => {
                cn.release();

                response.linkedTo = (err || !rows.length ? [] : rows);

                res.json(response);
            });
        }

    }));

};