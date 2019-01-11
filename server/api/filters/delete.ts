import { requireCredits } from 'lib/users/require-credits';
import { MySQL } from 'lib/MySQL';

export async function api_deleteFilter(req, res) {
  const db = new MySQL();

  try {
    await requireCredits(db, +req.session.uid);

    // Get filter
    const [filter] = await db.query(
      `
        SELECT
          type, accept_on_match AS acceptOnMatch
        FROM filters
        WHERE filter_id = ? AND user_id = ?
      `,
      [req.params.filter, req.session.uid]
    );
    if (!filter) throw 'Could not find filter';

    // Get emails linked to the filter
    const rows = await db.query(
      `SELECT email_id AS id FROM linked_filters WHERE filter_id = ?`,
      [req.params.filter]
    );

    /** @type {number[]} */
    const update = rows.map(email => email.id);

    // Delete the filter
    const result = await db.query('DELETE FROM filters WHERE filter_id = ?', [
      req.params.filter
    ]);
    if (!result.affectedRows) throw 'Could not delete filter';

    res.status(200).json({ update });
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
}
