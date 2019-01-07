const authenticate = require('lib/affiliates/authenticate');
import axios from 'axios';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function addAccountAsAffiliate(req, res) {
  const { email, note = '', credits } = req.body;
  const db = new MySQL();

  try {
    const affiliate = await authenticate(db, req);

    // Call xyAccounts to create account
    const { data: xyAccRes } = await axios.post(
      `${CONFIG.XYACCOUNTS_URL}/api/service/13/verified`,
      { key: CONFIG.XYACCOUNTS_KEY, email }
    );
    if (xyAccRes.error) throw 'Could not create Xyfir user';

    // Create user on Ptorx
    const dbRes = await db.query('INSERT INTO users SET ?', {
      email,
      credits,
      xyfir_id: xyAccRes.xyfir_id
    });
    if (!dbRes.affectedRows) throw 'Could not create Ptorx user';

    const user_id: number = dbRes.insertId;

    // Add email as primary email
    await db.query(`INSERT INTO primary_emails SET ? `, {
      user_id,
      address: email
    });

    // Add user to affiliate_created_users
    await db.query(`INSERT INTO affiliate_created_users SET ? `, {
      note,
      credits,
      user_id,
      affiliate_id: affiliate.id
    });
    db.release();

    res.status(200).json({ user_id });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
