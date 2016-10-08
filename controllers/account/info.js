const request = require("request");
const crypto = require("lib/crypto");
const db = require("lib/db");

const config = require("config");

/*
    GET api/account
    REQUIRED
        token: string
    RETURN
        {
            loggedIn: boolean, emails?: [{ id: number, address: string }],
            subscription?: number
        }
    DESCRIPTION
        Creates a new session using access token
        Returns all MAIN emails on account and subscription expiration
*/
module.exports = function(req, res) {

    db(cn => {
        const getInfo = (uid) => {
            let sql = `
                SELECT email_id as id, address FROM main_emails WHERE user_id = ?
            `;
            cn.query(sql, [uid], (err, rows) => {
                cn.release();

                res.json({
                    loggedIn: true, emails: rows || [],
                    subscription: req.session.subscription
                });
            });
        };

        // Validate access token
        if (req.query.token) {
            // [user_id, access_token]
            const token = crypto.decrypt(
                req.query.token, config.keys.accessToken
            ).split('-');

            // Invalid token
            if (!token[0] || !token[1]) {
                cn.release();
                res.json({ loggedIn: false });
                return;
            }

            // Get user's Xyfir ID
            sql = `SELECT xyfir_id FROM users WHERE user_id = ?`;

            cn.query(sql, [token[0]], (err, rows) => {
                // User doesn't exist
                if (err || !rows.length) {
                    cn.release();
                    res.json({ loggedIn: false });
                }
                // Validate access token with Xyfir Accounts
                else {
                    let url = config.addresses.xacc + "api/service/13/"
                    + `${config.keys.xacc}/${rows[0].xyfir_id}/${token[1]}`;

                    request(url, (err, response, body) => {
                        // Error in request
                        if (err) {
                            cn.release();
                            res.json({ loggedIn: false });
                            return;
                        }

                        body = JSON.parse(body);

                        // Error from Xyfir Accounts
                        if (body.error) {
                            req.session.uid = req.session.subscription = 0;
                            
                            cn.release();
                            res.json({ loggedIn: false });
                        }
                        // Access token valid
                        else {
                            getInfo(token[0]);
                        }
                    });
                }
            });
        }
        // Get info for dev user
        else if (config.environment.type == "dev") {
            getInfo(1);
        }
        // Force login
        else {
            cn.release();
            res.json({ loggedIn: false });
        }
    });

};