const MySQL = require('lib/mysql');

/**
 * DELETE /api/account/email/:email
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.email
 */
module.exports = async function(req, res) {
  const db = new MySQL();
  try {
    await db.query(
      `DELETE FROM primary_emails WHERE email_id = ? AND user_id = ?`,
      [req.params.email, req.session.uid]
    );
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ message: err });
  }
  db.release();
};
