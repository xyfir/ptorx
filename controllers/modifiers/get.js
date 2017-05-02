const db = require("lib/db");

/*
    GET api/modifiers/:mod
    RETURN
        {
            error: boolean, data: json-string, linkedTo: [{ id: number, address: string }],
            id: number, name: string, description: string, type: number
        }
    DESCRIPTION
        Returns data and linkedTo for a specific modifier
*/
module.exports = function(req, res) {

    let sql = `
        SELECT modifier_id as id, name, description, type, data FROM modifiers
        WHERE modifier_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.mod, req.session.uid], (err, rows) => {

        if (err || !rows.length) {
            cn.release();
            res.json({ error: true });
        }
        else {
            let response = rows[0];
            response.error = false;

            sql = `
                SELECT address, email_id as id FROM redirect_emails WHERE email_id IN (
                    SELECT email_id FROM linked_modifiers WHERE modifier_id = ?
                )
            `;
            cn.query(sql, [req.params.mod], (err, rows) => {
                cn.release();

                response.linkedTo = (err || !rows.length ? [] : rows);

                res.json(response);
            });
        }

    }));

};