const mysql = require('lib/mysql');

/*
  GET api/domains/:domain
  RETURN
    {
      error: boolean, message?: string,
      
      id?: number, domain?: string, verified?: boolean, added?: date-string,
      global: boolean, isCreator?: boolean,
      domainKey?: {
        name: string, value: string
      }
      users?: [{
        id: string, label: string, requestKey: string, added: date-string
      }]
    }
  DESCRIPTION
    Returns full info for domain and info for verified users
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();
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

    (domain.isCreator = domain.user_id == req.session.uid),
      (domain.error = false);

    if (!domain.isCreator) {
      db.release();
      return res.json(domain);
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

    res.json(domain);
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
