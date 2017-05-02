const request = require("request");
const stripe = require("stripe");
const db = require("lib/db");

const config = require("config");

function setSubscription(subscription, days) {
    return Date.now() > subscription
        ? (Date.now() + ((60 * 60 * 24 * days) * 1000))
        : (subscription + ((60 * 60 * 24 * days) * 1000));
}

// Give user who referred buyer one week subscription for every month bought
function rewardReferrer(cn, ref, days) {
    let sql = `
        SELECT subscription FROM users WHERE user_id = ?
    `, vars = [ref];

    cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
        }
        else {
            sql = `
                UPDATE users SET subscription = ? WHERE user_id = ?
            `, vars = [
                setSubscription(rows[0].subscription, (days / 30) * 7 ), ref
            ];

            cn.query(sql, vars, (err, result) => cn.release());
        }
    });
}

// Notify XACC of purchase
function rewardAffiliate(aff, amount) {
    request.post({
        url: config.address.xacc + "api/affiliate/purchase", form: {
            service: 13, serviceKey: config.keys.xacc,
            promoCode: aff, amount
        }
    }, (err, response, body) => 1);
}

/*
    POST api/account/stripe-purchase
    REQUIRED
        stripeToken: string, subscription: number
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Add months to user's subscription after charging card via Stripe
*/
module.exports = function(req, res) {

    let sql = `
        SELECT subscription, referral FROM users WHERE user_id = ?
    `, vars = [
        req.session.uid
    ];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) {
            cn.release();
            res.json({ error: true, message: "An unknown error occured" });
            return;
        }

        let amount = [0, 300, 1500, 2400][req.body.subscription];

        if (!amount) {
            res.json({ error: true, message: "Invalid subscription length" });
            return;
        }

        // Add days to current subscription expiration (or now())
        const days = [0, 30, 180, 365][req.body.subscription];
        const subscription = setSubscription(rows[0].subscription, days);
        
        const referral = JSON.parse(rows[0].referral);

        // Discount 10% off of first purchase
        if ((referral.referral || referral.affiliate) && !referral.hasMadePurchase) {
            referral.hasMadePurchase = true;
            amount -= amount * 0.10;
        }
        
        stripe(config.keys.stripe).charges.create({
            amount, currency: "usd", source: req.body.stripeToken,
            description: "Ptorx - Premium Subscription"
        }, (err, charge) => {
            if (err) {
                res.json({
                    error: true,
                    message: "Error processing your card. Please try again."
                }); return;
            }

            // Update user's account
            sql = `
                UPDATE users SET subscription = ?, referral = ?, trial = 0
                WHERE user_id = ?
            `, vars = [
                subscription, JSON.stringify(referral),
                req.session.uid
            ];

            cn.query(sql, vars, (err, result) => {
                if (err || !result.affectedRows) {
                    cn.release();
                    res.json({ error: true, message: "An unknown error occured" });
                    return;
                }
                else if (referral.referral) {
                    rewardReferrer(cn, referral.referral, days);
                }
                else if (referral.affiliate) {
                    cn.release();
                    rewardAffiliate(referral.affiliate, amount);
                }
                else {
                    cn.release();
                }
                
                req.session.subscription = subscription;
                res.json({ error: false });
            });
        });
    }));

};