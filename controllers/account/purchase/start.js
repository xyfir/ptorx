const request = require('superagent');
const CONFIG = require('config');
const moment = require('moment');
const MySQL = require('lib/mysql');

/**
 * `POST api/account/purchase`
 * @param {object} req
 * @param {object} req.body
 * @param {string} req.body.type - 'normal|iap|swiftdemand'
 */
/**
 * @typedef {object} ResponseBody
 * @prop {string} [message]
 * @prop {string} [url]
 */
module.exports = async function(req, res) {

  const db = new MySQL;

  try {
    await db.getConnection();
    const [user] = await db.query(
      'SELECT email, subscription, referral FROM users WHERE user_id = ?',
      [req.session.uid]
    );

    if (!user) throw 'No user';

    const referral = JSON.parse(user.referral);
    const discount =
      (referral.user || referral.promo) &&
      !referral.hasMadePurchase;
    referral.hasMadePurchase = true;

    const methods = (() => {
      switch (req.body.type) {
        case 'iap': return ['iap'];
        case 'normal': return ['card', 'crypto'];
        case 'swiftdemand': return ['swiftdemand'];
      }
    })();

    /** @type {number} */
    let refUserSubscription;
    if (referral.user) {
      const [ru] = await db.query(
        'SELECT subscription FROM users WHERE user_id = ?', [referral.user]
      );
      if (ru) refUserSubscription = setSubscription(ru.subscription, 30);
    }
    db.release();

    const payment = await request
      .post(`${CONFIG.addresses.xyPayments}/api/payments`)
      .send({
        seller_id: CONFIG.ids.xyPayments,
        seller_key: CONFIG.keys.xyPayments,
        product_id: req.body.type == 'swiftdemand'
          ? CONFIG.ids.products.threeMonthSwiftDemand
          : CONFIG.ids.products.oneYear,
        methods,
        description: 'Ptorx Premium',
        info: {
          user_id: req.session.uid,
          referral,
          subscription: setSubscription(
            user.subscription, req.body.type == 'swiftdemand' ? 90 : 365
          ),
          refUserSubscription
        },
        email: user.email,
        redirect_url:
          `${CONFIG.addresses.ptorx.root}api/account/purchase` +
          `?payment_id=PAYMENT_ID`,
        discount: discount ? 10 : null
      });

    res.status(200).json({ url: payment.body.url });
  }
  catch (err) {
    db.release();
    res.status(400).json({ message: err });
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