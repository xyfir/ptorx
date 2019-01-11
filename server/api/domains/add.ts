import { Request, Response } from 'express';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';
import axios from 'axios';

export async function api_addDomain(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [row] = await db.query(
      `SELECT id AS domainId FROM domains WHERE domain = ?`,
      [req.body.domain, req.session.uid]
    );

    // Domain already exists; user must request access
    if (row) {
      // Generate request key
      const key = uuid();

      // Add user to domain_users (update key if already linked to domain)
      await db.query(
        `
          INSERT INTO domain_users SET ?
          ON DUPLICATE KEY UPDATE requestKey = '${key}'
        `,
        {
          domainId: row.domainId,
          userId: req.session.uid,
          requestKey: key
        }
      );

      db.release();
      res.status(200).json({ requestKey: key });
    }
    // Domain does not exist; user must verify ownership
    else {
      // Add domain to Mailgun
      const { data: mgRes } = await axios.post(
        `${CONFIG.MAILGUN_URL}/domains`,
        {
          name: req.body.domain,
          spam_action: 'tag',
          wildcard: false
        }
      );

      // Get domainkey
      const key = mgRes.sending_dns_records.find(r =>
        /\._domainkey\./.test(r.name)
      );

      // Add database, user, key to domains
      const dbRes = await db.query(`INSERT INTO domains SET ?`, {
        domain: req.body.domain,
        userId: req.session.uid,
        domainKey: JSON.stringify({ name: key.name, value: key.value })
      });

      const domainId = dbRes.insertId;

      // Add user to domain_users
      await db.query(`INSERT INTO domain_users SET ?`, {
        domainId: domainId,
        userId: req.session.uid,
        authorized: true
      });

      db.release();
      res.status(200).json({ domainId, domainKey: key });
    }
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
