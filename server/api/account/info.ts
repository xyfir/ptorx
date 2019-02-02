import { NextFunction, Response, Request } from 'express';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';
import axios from 'axios';

const Cryptr = require('cryptr');
const cryptr = new Cryptr(CONFIG.ACCESS_TOKEN_KEY);

export async function api_getAccountInfo(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const db = new MySQL();

  try {
    let sql, vars, rows, uid, row;

    // Validate access token
    if (req.query.token) {
      // [userId, access_token]
      const token = cryptr.decrypt(req.query.token).split('-');

      // Invalid token
      if (!token[0] || !token[1]) throw 'Invalid token 1';

      sql = `
        SELECT xyfirId, credits, emailTemplate
        FROM users WHERE userId = ?
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
            xid: rows[0].xyfirId,
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
      sql = 'SELECT credits, emailTemplate FROM users WHERE userId = 1';
      rows = await db.query(sql);
      uid = 1;
      row = rows[0];
    }
    // Force login
    else {
      throw 'Forcing login';
    }

    sql = `
      SELECT id, address FROM primary_emails WHERE userId = ?
    `;
    vars = [uid];

    const emails = await db.query(sql, vars);
    db.release();

    // Set session, return account info
    req.jwt.userId = uid;

    res.status(200).json({
      loggedIn: true,
      uid,
      emails,
      credits: row.credits,
      emailTemplate: row.emailTemplate
    });
  } catch (err) {
    db.release();
    res.clearCookie('jwt');
    res.status(200).json({ loggedIn: false });
  }
}
