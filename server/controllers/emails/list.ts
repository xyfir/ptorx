import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/emails
  RETURN
    {

      emails: [{
        id: number, name: string, description: string, address: string
      }]
    }
  DESCRIPTION
    Returns basic information for all REDIRECT emails linked to account
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const emails = await db.query(
      `
      SELECT
        pxe.email_id AS id, pxe.name, pxe.description,
        CONCAT(pxe.address, '@', d.domain) AS address
      FROM
        proxy_emails AS pxe, domains AS d
      WHERE
        pxe.user_id = ? AND d.id = pxe.domain_id
    `,
      [req.session.uid]
    );
    db.release();

    res.status(200).json({ emails });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
};
