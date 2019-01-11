import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';
import axios from 'axios';

const Cryptr = require('cryptr');
const cryptr = new Cryptr(CONFIG.ACCESS_TOKEN_KEY);

export async function api_getAccountInfo(req, res) {
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
        SELECT xyfir_id, referral, credits, email_template
        FROM users WHERE user_id = ?
      `;
      vars = [token[0]];
      rows = await db.query(sql, vars);

      if (!rows.length) throw 'User does not exist';

      // Validate access token with Xyfir Accounts
      const xaccResult = await axios.get(
        `${CONFIG.XYACCOUNTS_URL}/api/service/13/user`,
        {
          params: {
            key: CONFIG.XYACCOUNTS_KEY,
            xid: rows[0].xyfir_id,
            token: token[1]
          }
        }
      );
      if (xaccResult.data.error) throw 'Invalid token 2';

      uid = token[0];
      row = rows[0];
    }
    // Get info for dev user
    else if (!CONFIG.PROD) {
      sql = `
        SELECT referral, credits, email_template
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

    res.status(200).json({
      loggedIn: true,
      uid,
      emails,
      referral: JSON.parse(row.referral),
      credits: row.credits,
      email_template: row.email_template
    });
  } catch (err) {
    db.release();
    req.session.destroy();
    res.status(200).json({ loggedIn: false });
  }
}
