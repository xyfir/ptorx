const mysql = require('lib/mysql');

/*
  GET api/emails
  RETURN
    {
      error: boolean, message?: string,
      emails: [{
        id: number, name: string, description: string, address: string
      }]
    }
  DESCRIPTION
    Returns basic information for all REDIRECT emails linked to account
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const emails = await db.query(`
      SELECT
        re.email_id AS id, re.name, re.description,
        CONCAT(re.address, '@', d.domain) AS address
      FROM
        redirect_emails AS re, domains AS d
      WHERE
        re.user_id = ? AND d.id = re.domain_id
    `, [
      req.session.uid
    ]);
    db.release();

    res.json({ error: false, emails });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err, emails: [] });
  }

};