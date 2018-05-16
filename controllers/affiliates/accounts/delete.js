const authenticate = require('lib/affiliates/authenticate');
const deleteUser = require('lib/user/delete');
const MySQL = require('lib/mysql');

/*
  DELETE /api/affiliates/accounts/:id
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const affiliate = await authenticate(db, req);

    // Verify user was created by affiliate
    const rows = await db.query(
      'SELECT user_id FROM affiliate_created_users WHERE user_id = ? AND affiliate_id = ?',
      [req.params.id, affiliate.id]
    );
    if (!rows.length) throw 'You cannot delete this user';

    await deleteUser(db, +req.params.id);
    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ message: err.toString() });
  }
};
