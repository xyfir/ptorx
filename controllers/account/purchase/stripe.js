const request = require('superagent');
const moment = require('moment');
const stripe = require('stripe');
const mysql = require('lib/mysql');

const config = require('config');

/*
  POST api/account/purchase/stripe
  REQUIRED
    token: string
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Complete a user's subscription purchase
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    let rows = await db.query(
      'SELECT subscription, referral FROM users WHERE user_id = ?',
      [req.session.uid]
    );

    if (!rows.length) throw 'Invalid user';

    const subscription = setSubscription(rows[0].subscription, 365);
    const ref = JSON.parse(rows[0].referral);
    let amount = 2500;

    // Discount 10% off of first purchase
    if ((ref.referral || ref.affiliate) && !ref.hasMadePurchase) {
      ref.hasMadePurchase = true,
      amount = 2250;
    }

    const charge = await stripe(config.keys.stripe).charges.create({
      amount, currency: 'usd', source: req.body.token,
      description: 'Ptorx'
    });

    // Update user's account
    const result = await db.query(`
      UPDATE users SET subscription = ?, referral = ?, trial = 0
      WHERE user_id = ?
    `, [
      subscription, JSON.stringify(ref),
      req.session.uid
    ]);

    if (!result.affectedRows) throw 'Could not update subscription';
      
    if (ref.referral) {
      rows = await db.query(
        'SELECT subscription FROM users WHERE user_id = ?',
        [ref.referral]
      );

      if (rows.length) {
        await db.query(
          'UPDATE users SET subscription = ? WHERE user_id = ?',
          [setSubscription(rows[0].subscription, 30), ref.referral]
        );
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

/**
 * Adds days to the user's subscription.
 * @param {number} subscription
 * @param {number} days
 * @return {number}
 */
function setSubscription(subscription, days) {
  return Date.now() > subscription
    ? +moment().add(days, 'days').format('x')
    : +moment(subscription).add(days, 'days').format('x');
}