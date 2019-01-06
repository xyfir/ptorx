import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/domains
  RETURN
    {

      domains?: [{
        id: number, domain: string, isCreator: boolean
      }]
    }
  DESCRIPTION
    Returns all domains that the user is authorized to use
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const rows = await db.query(
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
    db.release();

    if (!rows.length) throw 'No domains';

    res.status(200).json({ domains: rows });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
};
