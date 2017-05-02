const request = require("request");
const crypto = require("lib/crypto");
const db = require("lib/db");

const config = require("config");

/*
    POST api/account/login
    REQUIRED
        xid: string, auth: string
    OPTIONAL
        referral: number, affiliate: string
    RETURN
        { error: boolean, accessToken?: string }
    DESCRIPTION
        Register or login user
*/
module.exports = function(req, res) {

    let url = config.addresses.xacc
        + "api/service/13"
        + "/" + config.keys.xacc
        + "/" + req.body.xid
        + "/" + req.body.auth;

    request(url, (err, response, body) => {
        if (err) {
            res.json({ error: true });
            return;
        }

        body = JSON.parse(body);

        if (body.error) {
            res.json({ error: true });
            return;
        }

        let sql = `
            SELECT user_id, subscription, xad_id FROM users WHERE xyfir_id = ?
        `;
        db(cn => cn.query(sql, [req.body.xid], (err, rows) => {
            // First login
            if (!rows.length) {
                let insert = {
                    xyfir_id: req.body.xid, email: body.email, xad_id: body.xadid,
                    subscription: Date.now() + (1000 * (60 * 60 * 24 * 7)),
                    referral: "{}"
                };
                
                const createAccount = () => {
                    sql = "INSERT INTO users SET ?";
                    
                    cn.query(sql, insert, (err, result) => {
                        cn.release();

                        if (err || !result.affectedRows) {
                            res.json({ error: true });
                        }
                        else {
                            req.session.uid = result.insertId;
                            req.session.xadid = body.xadid;
                            req.session.subscription = insert.subscription;

                            res.json({
                                error: false, accessToken: crypto.encrypt(
                                    result.insertId + "-" + body.accessToken,
                                    config.keys.accessToken
                                )
                            });
                        }
                    });
                };

                if (req.body.referral) {
                    insert.referral = JSON.stringify({
                        referral: req.body.referral, hasMadePurchase: false
                    });

                    createAccount();
                }
                // Validate affiliate promo code
                else if (req.body.affiliate) {
                    request.post({
                        url: config.address.xacc + "api/affiliate/signup", form: {
                            service: 13, serviceKey: config.keys.xacc,
                            promoCode: req.body.affiliate
                        }
                    }, (err, response, body) => {
                        if (err) {
                            createAccount();
                        }
                        else {
                            body = JSON.parse(body);

                            if (!body.error && body.promo == 4) {
                                insert.referral = JSON.stringify({
                                    affiliate: req.body.affiliate,
                                    hasMadePurchase: false
                                });
                            }

                            createAccount();
                        }
                    });
                }
                else {
                    createAccount();
                }
            }
            // Update data
            else {
                sql = "UPDATE users SET email = ? WHERE user_id = ?"
                cn.query(sql, [body.email, rows[0].user_id], (err, result) => {
                    cn.release();

                    if (err) {
                        res.json({ error: true });
                    }
                    else {
                        req.session.uid = rows[0].user_id;
                        req.session.xadid = rows[0].xad_id;
                        req.session.subscription = rows[0].subscription;

                        res.json({
                            error: false, accessToken: crypto.encrypt(
                                rows[0].user_id + "-" + body.accessToken,
                                config.keys.accessToken
                            )
                        });
                    }
                });
            }
        }));
    });

};