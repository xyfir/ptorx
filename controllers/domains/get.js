const mysql = require('lib/mysql');

/*
  GET api/domains/:domain
  RETURN
    {
      error: boolean, message?: string,
      
      id?: number, domain?: string, domainKey?: string, verified?: boolean,
      added?: date-string,
      users?: [{
        id: string, label: string, requestKey: string, added: date-string
      }]
    }
  DESCRIPTION
    Returns full info for domain and info for verified users
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [domain] = await db.query(`
      SELECT
        id, domain, domain_key AS domainKey, verified, added
      FROM domains
      WHERE id = ? AND user_id = ?
    `, [
      req.params.domain, req.session.uid
    ]);

    if (!domain) throw 'Could not find domain';

    domain.users = await db.query(`
      SELECT user_id AS id, label, request_key AS requestKey, added
      FROM domain_users
      WHERE domain_id = ? AND user_id != ?
      ORDER BY added ASC
    `, [
      domain.id, req.session.uid
    ]);
    db.release();

    domain.error = false;
    res.json(domain);
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};