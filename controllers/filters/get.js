const db = require("lib/db");

/*
    GET api/filters/:filter
    RETURN
        {
            error: boolean, find: string, acceptOnMatch: boolean,
            regex: boolean, linkedTo: [{ id: number, address: string }],
            id: number, name: string, description: string, type: number
        }
    DESCRIPTION
        Returns data for a specific filter
*/
module.exports = function(req, res) {

    let sql = `
        SELECT filter_id as id, name, description, type, find, accept_on_match as acceptOnMatch,
        use_regex as regex FROM filters WHERE filter_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {

        if (err || !rows.length) {
            cn.release();
            res.json({ error: true });
        }
        else {
            let response = rows[0];
            
            response.error = false;
            response.regex = !!(+response.regex);
            response.acceptOnMatch = !!(+response.acceptOnMatch);

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