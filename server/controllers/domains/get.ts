import { MySQL } from 'lib/MySQL';

export async function getDomain(req, res) {
  const db = new MySQL();

  try {
    const [domain] = await db.query(
      `
      SELECT
        id, user_id, domain, domain_key AS domainKey, added, verified, global
      FROM domains
      WHERE id = ?
    `,
      [req.params.domain]
    );

    if (!domain) throw 'Could not find domain';

    domain.isCreator = domain.user_id == req.session.uid;

    if (!domain.isCreator) {
      db.release();
      return res.status(200).json(domain);
    }

    if (domain.domainKey) domain.domainKey = JSON.parse(domain.domainKey);

    domain.users = await db.query(
      `
      SELECT user_id AS id, label, request_key AS requestKey, added
      FROM domain_users
      WHERE domain_id = ? AND user_id != ? AND authorized = 1
      ORDER BY added ASC
    `,
      [domain.id, req.session.uid]
    );
    db.release();

    res.status(200).json(domain);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
