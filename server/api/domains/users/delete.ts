import { deleteProxyEmail } from 'api/emails/delete';
import { MySQL } from 'lib/MySQL';

export async function deleteDomainUser(req, res) {
  const db = new MySQL();

  try {
    let result;

    // Remove self from domain
    if (req.params.user == req.session.uid) {
      result = await db.query(
        'DELETE FROM domain_users WHERE domain_id = ? AND user_id = ?',
        [req.params.domain, req.params.user]
      );
    }
    // Remove another user from domain
    else {
      result = await db.query(
        `
        DELETE FROM domain_users WHERE user_id = ? AND domain_id IN (
          SELECT id FROM domains WHERE id = ? AND user_id = ?
        )
      `,
        [req.params.user, req.params.domain, req.session.uid]
      );
    }

    if (!result.affectedRows) throw 'Could not remove from domain';

    // Get all of user's proxy emails on this domain
    const emails = await db.query(
      `
      SELECT email_id AS id FROM proxy_emails
      WHERE user_id = ? AND domain_id = ?
    `,
      [req.params.user, req.params.domain]
    );
    db.release();

    // Delete emails
    for (let email of emails) {
      await deleteProxyEmail(
        { params: { email: email.id }, session: { uid: req.params.user } },
        { json: () => 1 }
      );
    }

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
