import { MySQL } from 'lib/MySQL';

export async function getModifiers(req, res) {
  const db = new MySQL();

  try {
    const sql = `
      SELECT
        user_id AS uid, modifier_id AS id, name, description, type,
        IF(user_id = 0, 1, 0) AS global
      FROM modifiers WHERE user_id = ? OR user_id = 0
    `,
      vars = [req.session.uid],
      modifiers = await db.query(sql, vars);

    res.status(200).json({ modifiers });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
