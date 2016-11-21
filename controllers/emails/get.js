const db = require("lib/db");

/*
    GET api/emails/:email
    RETURN
        { 
            error: boolean, toEmail: string, saveMail: boolean, spamFilter: boolean,
            id: number, name: string, description: string, address: string,
            filters: [{
                id: number, name: string, description: string, type: number
            }], modifiers: [{
                id: number, name: string, description: string, type: number
            }]
        }
    DESCRIPTION
        Returns data for a specific REDIRECT email
*/
module.exports = function(req, res) {

    // Ensure user owns email and grab toEmail/saveMail
    let sql = `
        SELECT email_id as id, name, description, address, save_mail as saveMail,
        spam_filter as spamFilter, (
            SELECT address FROM main_emails WHERE email_id IN (
                SELECT to_email FROM redirect_emails WHERE email_id = ? AND user_id = ?
            )
        ) as toEmail FROM redirect_emails WHERE email_id = ?
    `;
    let vars = [
        req.params.email, req.session.uid,
        req.params.email
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length || rows[0].toEmail == null) {
            cn.release();
            res.json({ error: true });
        }
        else {
            let response = rows[0];
            
            response.error = false;
            response.saveMail = !!(+response.saveEmail);
            response.spamFilter = !!(+response.spamFilter);

            // Grab basic info for all filters linked to email
            sql = `
                SELECT filter_id as id, name, description, type
                FROM filters WHERE filter_id IN (
                    SELECT filter_id FROM linked_filters WHERE email_id = ?
                )
            `;
            cn.query(sql, [req.params.email], (err, rows) => {
                response.filters = (err || !rows.length ? [] : rows);

                // Grab basic info for all modifiers linked to email
                sql = `
                    SELECT
                        modifiers.modifier_id as id, modifiers.name,
                        modifiers.description, modifiers.type
                    FROM
                        modifiers, linked_modifiers
                    WHERE
                        modifiers.modifier_id = linked_modifiers.modifier_id
                        AND linked_modifiers.email_id = ?
                    ORDER BY linked_modifiers.order_number
                `;
                cn.query(sql, [req.params.email], (err, rows) => {
                    cn.release();

                    response.modifiers = (err || !rows.length ? [] : rows);
                    res.json(response);
                });
            });
        }

    }));

};