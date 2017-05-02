const clearCache = require("lib/email/clear-cache");
const db = require("lib/db");

/*
    DELETE api/filters/:filter
    RETURN
        { error: boolean, update?: number[] }
    DESCRIPTION
        Deletes a filter
*/
module.exports = function(req, res) {

    let sql = `
        SELECT type, accept_on_match as acceptOnMatch FROM filters WHERE filter_id = ? AND user_id = ?
    `;
    db(cn => cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {
        if (err || !rows.length) {
            res.json({ error: true });
        }
        else {
            const data = rows[0];

            // Delete filter, linked entries, and return response to user
            const deleteFilter = (clear, update) => {
                sql = "DELETE FROM filters WHERE filter_id = ?";
                cn.query(sql, [req.params.filter], (err, result) => {
                    cn.release();
                    
                    // Error deleting filter
                    if (err || !result.affectedRows) {
                        res.json({ error: true });
                    }
                    // Deleted fine, no further action
                    else if (update === undefined) {
                        res.json({ error: false })
                    }
                    // Deleted, send emails that need their MG route updated to client
                    else if (!clear) {
                        res.json({ error: false, update });
                    }
                    // Deleted, clear Redis cache for emails linked to filter
                    else {
                        update.forEach(email => clearCache(email));
                        res.json({ error: false });
                    }
                });
            };

            sql = `SELECT email_id as id FROM linked_filters WHERE filter_id = ?`;
            cn.query(sql, [req.params.filter], (err, rows) => {
                if (err) {
                    cn.release();
                    res.json({ error: true });
                }
                // Filter was not linked to any email(s)
                else if (!rows.length) {
                    deleteFilter();
                }
                // Filter was linked to email(s)
                else {
                    let update = rows.map(email => email.id);

                    // MailGun routes need to be updatedf
                    if ([1, 2, 3, 6].indexOf(data.type) > -1 && !!(+data.acceptOnMatch))
                        deleteFilter(false, update);
                    // Redis cache needs to be cleared
                    else
                        deleteFilter(true, update);
                }
            });
        }
    }));

};