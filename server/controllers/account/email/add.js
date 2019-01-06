const MySQL = require('lib/mysql');

/*
  POST /api/account/email/:email
  RETURN
    { id?: number, message?: string }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const [row] = await db.query(
      `
        SELECT (
          SELECT COUNT(email_id) FROM primary_emails WHERE user_id = ?
        ) AS emails, (
          SELECT COUNT(email_id) FROM primary_emails WHERE user_id = ? AND address = ?
        ) AS email_exists
      `,
      [req.session.uid, req.session.uid, req.params.email]
    );

    if (row.email_exists > 0)
      throw 'This email is already linked to your account';
    if (req.params.email.length < 6 || req.params.email.length > 320)
      throw 'Invalid email length. 6-320 characters required';

    const result = await db.query('INSERT INTO primary_emails SET ?', {
      user_id: req.session.uid,
      address: req.params.email
    });
    if (!result.affectedRows) throw 'Could not add email';

    res.status(200).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ message: err });
  }

  db.release();
};
