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
            subscription?: number, uid?: number, trial?: boolean,
            referral?: {
                affiliate?: string, referral?: string,
                hasMadePurchase?: boolean
            }
        }
    DESCRIPTION
        Creates a new session using access token
        Returns all MAIN emails on account and subscription expiration
*/
module.exports = function(req, res) {

    // Wipe session, return loggedIn: false
    const error = () => {
        req.session.uid = req.session.subscription = 0;
        req.session.xadid = "";

        res.json({ loggedIn: false });
    };

    db(cn => {
        let sql = "";

        const getInfo = (uid, row) => {
            sql = `
                SELECT email_id as id, address FROM main_emails WHERE user_id = ?
            `;
            cn.query(sql, [uid], (err, emails) => {
                cn.release();

                // Set session, return account info
                req.session.uid = uid,
                req.session.xadid = row.xadid,
                req.session.subscription = row.subscription;
                
                res.json({
                    loggedIn: true, uid, emails, subscription: row.subscription,
                    referral: JSON.parse(row.referral), trial: !!row.trial
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
                error();
                return;
            }

            sql = `
                SELECT xyfir_id, subscription, xad_id, referral, trial
                FROM users WHERE user_id = ?
            `;

            cn.query(sql, [token[0]], (err, rows) => {
                // User doesn't exist
                if (err || !rows.length) {
                    cn.release();
                    error();
                }
                // Validate access token with Xyfir Accounts
                else {
                    let url = config.addresses.xacc + "api/service/13/"
                    + `${config.keys.xacc}/${rows[0].xyfir_id}/${token[1]}`;

                    request(url, (err, response, body) => {
                        // Error in request
                        if (err) {
                            cn.release();
                            error();
                            return;
                        }

                        body = JSON.parse(body);

                        // Error from Xyfir Accounts
                        if (body.error) {
                            req.session.uid = req.session.subscription = 0;
                            
                            cn.release();
                            error();
                        }
                        // Access token valid
                        else {
                            getInfo(token[0], rows[0]);
                        }
                    });
                }
            });
        }
        // Get info for dev user
        else if (config.environment.type == "dev") {
            sql = `
                SELECT subscription, xad_id, referral, trial FROM users
                WHERE user_id = 1
            `;

            cn.query(sql, (err, rows) => getInfo(1, rows[0]));
        }
        // Force login
        else {
            cn.release();
            error();
        }
    });

};