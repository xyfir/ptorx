import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/emails/availability
  REQUIRED
    address: string, domain: number
  RETURN
    { available?: boolean }
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

    res.status(200).json({ available: !rows.length });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
};
