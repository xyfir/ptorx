import db = require("../../lib/db");

/*
    GET api/emails/:email
    RETURN
        {
            { error: boolean, toEmail: string, saveMail: boolean, spamFilter: boolean, filters: [{
                id: number, name: string, description: string, type: number
            }], modifiers: [{
                id: number, name: string, description: string, type: number
            }] }
        }
    DESCRIPTION
        Returns data for a specific REDIRECT email
*/
export = function (req, res) {

    // Ensure user owns email and grab toEmail/saveMail
    let sql: string = `
        SELECT save_mail as saveMail, spam_filter as spamFilter, (
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

        let response = {
            error: true, toEmail: "", saveMail: false, spamFilter: true,
            filters: [], modifiers: []
        };

        if (err || !rows.length || rows[0].toEmail == null) {
            cn.release();
            res.json(response);
        }
        else {
            response.error = false;
            response.toEmail = rows[0].toEmail;
            response.saveMail = !!(+rows[0].saveEmail);
            response.spamFilter = !!(+rows[0].spamFilter);

            // Grab basic info for all filters linked to email
            sql = `
                SELECT filter_id as id, name, description, type FROM filters WHERE filter_id IN (
                    SELECT filter_id FROM linked_filters WHERE email_id = ?
                )
            `;
            cn.query(sql, [req.params.email], (err, rows) => {
                response.filters = (err || !rows.length ? [] : rows);

                // Grab basic info for all modifiers linked to email
                sql = `
                    SELECT modifier_id as id, name, description, type FROM modifiers WHERE modifier_id IN (
                        SELECT modifier_id FROM linked_modifiers WHERE email_id = ?
                    )
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