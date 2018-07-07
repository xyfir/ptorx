const authenticate = require('lib/affiliates/authenticate');
const request = require('superagent');
const config = require('config');
const MySQL = require('lib/mysql');

/*
  POST /api/affiliates/accounts
  REQUIRED
    email: string, credits: number
  OPTIONAL
    note: string
  RETURN
    { user_id: number }
*/
module.exports = async function(req, res) {
  const { email, note = '', credits } = req.body;
  const db = new MySQL();

  try {
    await db.getConnection();
    const affiliate = await authenticate(db, req);

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
      credits,
      xyfir_id: xyAccRes.xyfir_id
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
      credits,
      user_id,
      affiliate_id: affiliate.id
    });
    db.release();

    res.status(200).json({ user_id });
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
