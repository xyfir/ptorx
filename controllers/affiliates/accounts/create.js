const request = require('superagent');
const moment = require('moment');
const config = require('config');
const MySQL = require('lib/mysql');
const auth = require('basic-auth');

/*
  POST /api/affiliates/accounts
  REQUIRED
    email: string
  OPTIONAL
    note: string
  RETURN
    { user_id: number }
*/
module.exports = async function(req, res) {
  const { email, note = '' } = req.body;
  const cred = auth(req);
  const db = new MySQL();

  try {
    // Validate affiliate id / key
    await db.getConnection();
    const rows = await db.query(
      'SELECT user_id FROM affiliates WHERE user_id = ? AND api_key = ?',
      [cred.name, cred.pass]
    );
    if (!rows.length) throw 'Invalid affiliate id and/or key';

    // Call xyAccounts to create account
    const { body: xyAccRes } = await request
      .post(`${config.addresses.xacc}api/service/13/verified`)
      .send({
        key: config.keys.xacc,
        email
      });
    if (xyAccRes.error) throw 'Could not create Xyfir user';

    // Create user on Ptorx
    const dbRes = await db.query('INSERT INTO users SET ?', {
      email,
      xyfir_id: xyAccRes.xyfir_id,
      subscription:
        moment()
          .add(1, 'year')
          .unix() * 1000
    });
    if (!dbRes.affectedRows) throw 'Could not create Ptorx user';

    /** @type {number} */
    const user_id = dbRes.insertId;

    // Add email as primary email
    await db.query(`INSERT INTO primary_emails SET ? `, {
      user_id,
      address: email
    });

    // Add user to affiliate_created_users
    await db.query(`INSERT INTO affiliate_created_users SET ? `, {
      note,
      user_id,
      affiliate_id: cred.name
    });

    res.status(200).json({ user_id });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
