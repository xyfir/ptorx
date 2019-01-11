import { api_deleteProxyEmail } from 'api/proxy-emails/delete';
import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_deleteDomainUser(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    let result;

    // Remove self from domain
    if (req.params.user == req.session.uid) {
      result = await db.query(
        'DELETE FROM domain_users WHERE domainId = ? AND userId = ?',
        [req.params.domain, req.params.user]
      );
    }
    // Remove another user from domain
    else {
      result = await db.query(
        `
        DELETE FROM domain_users WHERE userId = ? AND domainId IN (
          SELECT id FROM domains WHERE id = ? AND userId = ?
        )
      `,
        [req.params.user, req.params.domain, req.session.uid]
      );
    }

    if (!result.affectedRows) throw 'Could not remove from domain';

    // Get all of user's proxy emails on this domain
    const emails = await db.query(
      `
      SELECT proxyEmailId AS id FROM proxy_emails
      WHERE userId = ? AND domainId = ?
    `,
      [req.params.user, req.params.domain]
    );
    db.release();

    // Delete emails
    for (let email of emails) {
      await api_deleteProxyEmail(
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
