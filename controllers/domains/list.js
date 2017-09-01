const mysql = require('lib/mysql');

/*
  GET api/domains
  RETURN
    {
      error: boolean, message?: string,
      domains?: [{
        id: number, domain: string, isCreator: boolean
      }]
    }
  DESCRIPTION
    Returns all non-default domains linked to user's account
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const rows = await db.query(`
      SELECT
        id, domain, (user_id = ?) AS isCreator
      FROM domains
      WHERE id IN (
        SELECT domain_id FROM domain_users WHERE user_id = ?
      )
    `, [
      req.session.uid,
      req.session.uid
    ]);
    db.release();

    if (!rows.length) throw 'No domains';

    res.json({ error: false, domains: rows });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err, domains: [] });
  }

};