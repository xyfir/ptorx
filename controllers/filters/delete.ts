import db = require("../../lib/db");

/*
    DELETE api/filters/:filter
    RETURN
        { error: boolean, update?: number[] }
    DESCRIPTION
        Deletes a filter
*/
export = function (req, res) {

    let sql: string = `
        SELECT type, accept_on_match as acceptOnMatch FROM filters WHERE filter_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {
        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            // Delete filter, linked entries, and return response to user
            const deleteFilter = (update?: number[]) => {
                sql = "DELETE FROM filters WHERE filter_id = ?";
                cn.query(sql, [req.params.filter], (err, result) => {
                    cn.release();

                    if (err || !result.affectedRows)
                        res.json({ error: true });
                    else if (update === undefined)
                        res.json({ error: false })
                    else
                        res.json({ error: false, update });
                });
            };

            // Determine if MailGun routes need to be updated
            if ([1, 2, 3, 6].indexOf(req.body.type) && req.body.acceptOnMatch) {
                sql = `SELECT email_id as id FROM linked_filters WHERE filter_id = ?`;
                cn.query(sql, [req.params.filter], (err, rows) => {
                    cn.release();

                    if (err || !rows.length)
                        res.json({ error: false });
                    else
                        deleteFilter(rows.map(email => { return email.id; }));
                });
            }
            else {
                deleteFilter();
            }
        }
    }));

};