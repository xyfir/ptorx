import { authenticate } from 'lib/affiliates/authenticate';
import { deleteUser } from 'lib/user/delete';
import { MySQL } from 'lib/MySQL';

export async function deleteAccountAsAffiliate(req, res) {
  const db = new MySQL();

  try {
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
    res.status(400).json({ error: err });
  }
}
