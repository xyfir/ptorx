const db = require("db");

const config = require("config");
const mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

module.exports = () => db(cn => {

    let sql = `
        SELECT
            re.mg_route_id AS route, re.email_id AS eid,
            u.user_id AS uid
        FROM
            redirect_emails AS re, users AS u
        WHERE
            re.user_id = u.user_id
            AND u.subscription < UNIX_TIMESTAMP() * 1000
    `;

    const expiredUsers = [], deleteEmails = [];

    const finish = () => {
        sql = `
            UPDATE users SET subscription = 0, trial = 0 WHERE user_id IN (?)
        `;
        
        cn.query(sql, [expiredUsers], () => {
            sql = `
                DELETE FROM redirect_emails WHERE email_id IN (?)
            `;

            cn.query(sql, [deleteEmails], () => cn.release());
        });
    };

    cn.query(sql, vars)
        .on("error", finish)
        .on("result", (row) => {
            cn.pause();

            mailgun.routes(row.route).delete((err, body) => {
                if (!err) {
                    deleteEmails.push(row.eid);

                    if (expiredUsers.indexOf(row.uid) == -1)
                        expiredUsers.push(row.uid);
                }

                cn.resume();
            });
        })
        .on("end", finish);

});