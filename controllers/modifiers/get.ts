import db = require("../../lib/db");

/*
    GET api/modifiers/:mod
    RETURN
        { error: boolean, data: json-string, linkedTo: [{ id, address }] }
    DESCRIPTION
        Returns data and linkedTo for a specific modifier
*/
export = function (req, res) {

    let sql: string = `
        SELECT data FROM modifiers WHERE modifier_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.mod, req.session.uid], (err, rows) => {

        let response = { error: true, data: "", linkedTo: [] };

        if (err || !rows.length) {
            cn.release();
            res.json(response);
        }
        else {
            response.error = false;
            response.data = rows[0].data;

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