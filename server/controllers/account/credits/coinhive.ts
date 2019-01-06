const request = require('superagent');
const credit = require('lib/user/credit');
import * as CONFIG from 'constants/config';
const MySQL = require('lib/mysql');

const COST_PER_CREDIT = 0.0005; // in USD
const COINHIVE = 'https://api.coinhive.com';

let lastStatUpdate = 0;
/**
 * @typedef {object} CoinhiveStats
 * @prop {boolean} success
 * @prop {number} globalDifficulty
 * @prop {number} globalHashrate
 * @prop {number} blockReward
 * @prop {number} payoutPercentage
 * @prop {number} payoutPer1MHashes
 * @prop {number} xmrToUsd
 * @prop {number} updated
 * @prop {string} [error]
 */
/** @type {CoinhiveStats} */
let stats = null;

/**
 * Get payout stats for Coinhive. Load from cache, or update every 10+ minutes.
 * @async
 * @return {CoinhiveStats}
 */
async function getCoinhiveStats() {
  if (stats && Date.now() - 600 * 1000 < lastStatUpdate) return stats;

  const response = await request
    .get(`${COINHIVE}/stats/payout`)
    .query({ secret: CONFIG.COINHIVE_SECRET });
  stats = response.body;
  lastStatUpdate = Date.now();

  return stats;
}

/**
 * `GET /api/account/credits/coinhive`
 * @async
 */
/**
 * @typedef {object} ResponseBody
 * @prop {number} earned - Amount of credits the user has earned
 * @prop {string} message
 * @prop {number} [credits] - Amount of credits the user currently has
 */
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    let response = await request
      .get(`${COINHIVE}/user/balance`)
      .query({ secret: CONFIG.COINHIVE_SECRET, name: req.session.uid });
    if (!response.body.success) throw response.body.error;

    const stats = await getCoinhiveStats();

    // Payout per hash in USD
    const payoutPerHash = (stats.payoutPer1MHashes / 1000000) * stats.xmrToUsd;
    // User's uncredited balance in USD
    const balance = response.body.balance * payoutPerHash;

    // The total amount of credits the user has earned
    // Includes any credits the user *will* earn below on success
    const earned = Math.floor(
      (response.body.total * payoutPerHash) / COST_PER_CREDIT
    );

    // The user's current amount of credits
    /** @type {number} */
    let credits;

    // Credit user's account
    if (balance >= COST_PER_CREDIT) {
      // Determine how many credits to reward the user with
      // Take hashes in increments equal to COST_PER_CREDIT, leave remainder
      const reward = Math.floor(balance / COST_PER_CREDIT);

      response = await request
        .post(`${COINHIVE}/user/withdraw`)
        .type('form')
        .query({ secret: CONFIG.COINHIVE_SECRET })
        .send({
          name: req.session.uid,
          // Convert credits -> USD -> hashes
          amount: Math.ceil((reward * COST_PER_CREDIT) / payoutPerHash)
        });
      if (!response.body.success) throw response.body.error;

      credits = await credit(db, +req.session.uid, reward);
    }

    res.status(200).json({ earned, credits });
  } catch (err) {
    res.status(400).json({ message: err });
  }

  db.release();
};
