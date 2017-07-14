const request = require('superagent');
const stripe = require('stripe');
const mysql = require('lib/mysql');

const subscriptions = require('subscriptions');
const config = require('config');

function setSubscription(subscription, days) {
  return Date.now() > subscription
    ? (Date.now() + ((60 * 60 * 24 * days) * 1000))
    : (subscription + ((60 * 60 * 24 * days) * 1000));
}

/*
  POST api/account/stripe-purchase
  REQUIRED
    token: string, subscription: number
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Add months to user's subscription after charging card via Stripe
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    let sql = `
      SELECT subscription, referral FROM users WHERE user_id = ?
    `,
    vars = [
      req.session.uid
    ],
    rows = await db.query(sql, vars);

    if (!rows.length) throw 'Invalid user';

    let {amount} = subscriptions[+req.body.subscription];

    // Add days to current subscription expiration (or now())
    const {days} = subscriptions[+req.body.subscription];
    const subscription = setSubscription(rows[0].subscription, days);
    
    const ref = JSON.parse(rows[0].referral);

    // Discount 10% off of first purchase
    if ((ref.referral || ref.affiliate) && !ref.hasMadePurchase) {
      ref.hasMadePurchase = true;
      amount -= amount * 0.10;
    }

    const charge = await stripe(config.keys.stripe).charges.create({
      amount, currency: 'usd', source: req.body.token,
      description: 'Ptorx - Premium Subscription'
    });

    // Update user's account
    sql = `
      UPDATE users SET subscription = ?, referral = ?, trial = 0
      WHERE user_id = ?
    `,
    vars = [
      subscription, JSON.stringify(ref),
      req.session.uid
    ];
    const result = await db.query(sql, vars);

    if (!result.affectedRows) throw 'Could not update subscription';
      
    if (ref.referral) {
      sql = `
        SELECT subscription FROM users WHERE user_id = ?
      `,
      vars = [ref.referral],
      rows = await db.query(sql, vars);

      if (rows.length) {
        sql = `
          UPDATE users SET subscription = ? WHERE user_id = ?
        `,
        vars = [
          setSubscription(rows[0].subscription, (days / 30) * 7 ), ref.referral
        ];
        await db.query(sql, vars);
      }
    }
    else if (ref.affiliate) {
      request
        .post(config.address.xacc + 'api/affiliate/purchase')
        .send({
          service: 13, serviceKey: config.keys.xacc,
          promoCode: ref.affiliate, amount
        })
        .end(() => 1);
    }

    db.release();
    
    req.session.subscription = subscription;
    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};