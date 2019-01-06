import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/emails/availability
  REQUIRED
    address: string, domain: number
  RETURN
    { error: boolean, message?: string, available?: boolean }
  DESCRIPTION
    Checks whether an email address is available
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const rows = await db.query(
      'SELECT email_id FROM proxy_emails WHERE address = ? AND domain_id = ?',
      [req.query.address, req.query.domain]
    );
    db.release();

    res.json({ error: false, available: !rows.length });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
