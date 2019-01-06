import * as CONFIG from 'constants/config';
const request = require('superagent');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(CONFIG.ACCESS_TOKEN_KEY);
import { MySQL } from 'lib/MySQL';

/*
  GET /api/account
  REQUIRED
    token: string
  RETURN
    {
      loggedIn: boolean, uid?: number, affiliate?: boolean, credits?: number,
      email_template?: number,
      referral?: {
        type?: string, [type]?: string|number, data?: object,
        hasMadePurchase?: boolean
      },
      emails?: [{
        id: number, address: string
      }]
    }
  DESCRIPTION
    Creates a new session using access token
    Returns account info
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    let sql, vars, rows, uid, row;

    // Validate access token
    if (req.query.token) {
      // [user_id, access_token]
      const token = cryptr.decrypt(req.query.token).split('-');

      // Invalid token
      if (!token[0] || !token[1]) throw 'Invalid token 1';

      sql = `
        SELECT xyfir_id, referral, admin, affiliate, credits, email_template
        FROM users WHERE user_id = ?
      `;
      vars = [token[0]];
      rows = await db.query(sql, vars);

      if (!rows.length) throw 'User does not exist';

      // Validate access token with Xyfir Accounts
      const xaccResult = await request
        .get(`${CONFIG.XYACCOUNTS_URL}/api/service/13/user`)
        .query({
          key: CONFIG.XYACCOUNTS_KEY,
          xid: rows[0].xyfir_id,
          token: token[1]
        });

      if (xaccResult.body.error) throw 'Invalid token 2';

      uid = token[0];
      row = rows[0];
    }
    // Get info for dev user
    else if (!CONFIG.PROD) {
      sql = `
        SELECT referral, admin, affiliate, credits, email_template
        FROM users WHERE user_id = 1
      `;
      rows = await db.query(sql);

      uid = 1;
      row = rows[0];
    }
    // Force login
    else {
      throw 'Forcing login';
    }

    sql = `
      SELECT email_id as id, address FROM primary_emails WHERE user_id = ?
    `;
    vars = [uid];

    const emails = await db.query(sql, vars);
    db.release();

    // Set session, return account info
    req.session.uid = uid;
    req.session.admin = !!row.admin;

    res.json({
      loggedIn: true,
      uid,
      emails,
      referral: JSON.parse(row.referral),
      affiliate: !!row.affiliate,
      credits: row.credits,
      email_template: row.email_template
    });
  } catch (err) {
    db.release();
    req.session.destroy();
    res.json({ loggedIn: false });
  }
};
