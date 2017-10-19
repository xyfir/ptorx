const sendEmail = require("lib/email/send");
const db = require("lib/db");

const config = require("config");
const mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

module.exports = (fn) => db(cn => {

    let sql = `
        SELECT
            UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY)) * 1000
                AS startrange,
            UNIX_TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY)) * 1000
                AS endrange
    `;

    cn.query(sql, (err, rows) => {
        if (err) {
            cn.release();
            fn(true);
            return;
        }

        sql = `
            SELECT email, subscription, trial
            FROM users
            WHERE
                subscription >= ${rows[0].startrange}
                AND subscription <= ${rows[0].endrange}
        `;
        
        cn.query(sql)
            .on("error", () => {
                cn.release();
                fn(true);
            })
            .on("result", (row) => {
                cn.pause();

                sendEmail(
                    row.email,
                    "Your subscription is expiring soon",
                    `
                        Your <a href="https://ptorx.com">Ptorx</a> subscription is expiring soon! Increase your subscription in your <a href="https://ptorx.com/app/#/account/purchase-subscription">user panel</a> before it's too late.
                        <br /><br />
                        If your subscription expires, any proxy emails you have created will be deleted and you will no longer receive mail from them. Additionally, these deleted emails will <em>not</em> be able to be created again should you decide to purchase a new subscription after expiration.
                        <br /><br />
                        Your subscription will expire after <strong>${(new Date(row.subscription)).toLocaleString()}</strong> (server time).
                        <br />
                        Current server time is <strong>${(new Date()).toLocaleString()}</strong> (at time of sending this email).
                        <br /><br />
                        Thank you for being a Ptorx subscriber! We hope you'll stick around a bit longer.
                        <br /><br />
                        Have any questions or feedback? Send a reply to this email or use our <a href="https://xyfir.com/#/contact">contact form</a>. Interested in other Xyfir projects? Take a look at all of the projects in the <a href="https://xyfir.com/#/network">Xyfir Network</a>.
                    `,
                    () => cn.resume()
                );
            })
            .on("end", () => cn.release());
    });

});