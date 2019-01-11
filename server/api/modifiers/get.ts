import { MySQL } from 'lib/MySQL';

export async function api_getModifier(req, res) {
  const db = new MySQL();

  try {
    const [modifier] = await db.query(
      `
      SELECT
        modifier_id AS id, name, description, type, data
      FROM modifiers
      WHERE modifier_id = ? AND user_id = ?
    `,
      [req.params.mod, req.session.uid]
    );
    if (!modifier) throw 'Could not find modifier';

    modifier.linkedTo = await db.query(
      `
    SELECT
      email_id AS id, CONCAT(pxe.address, '@', d.domain) AS address
    FROM
      proxy_emails AS pxe, domains AS d
    WHERE
      pxe.email_id IN (
        SELECT email_id FROM linked_modifiers WHERE modifier_id = ?
      ) AND d.id = pxe.domain_id
    `,
      [req.params.mod]
    );
    db.release();

    res.status(200).json(modifier);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
