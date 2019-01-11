import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getDomains(req: Request, res: Response): Promise<void> {
  const db = new MySQL();
  try {
    const domains = await db.query(
      `
        SELECT
          id, domain, (user_id = ?) AS isCreator, global
        FROM domains
        WHERE
          global = 1 OR id IN (
            SELECT domain_id FROM domain_users
            WHERE user_id = ? AND authorized = 1
          )
      `,
      [req.session.uid, req.session.uid]
    );
    if (!domains.length) throw 'No domains';
    res.status(200).json(domains);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
