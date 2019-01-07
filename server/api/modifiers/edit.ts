import { buildModifierData } from 'lib/modifier/build-data';
import { validateModifier } from 'lib/modifier/validate';
import { MySQL } from 'lib/MySQL';

export async function editModifier(req, res) {
  const db = new MySQL();

  try {
    validateModifier(req.body);

    let sql = `
        UPDATE modifiers SET name = ?, description = ?, type = ?, data = ?
        WHERE modifier_id = ? AND user_id = ?
      `,
      vars = [
        req.body.name,
        req.body.description,
        req.body.type,
        buildModifierData(req.body),
        req.params.mod,
        req.session.uid
      ];

    const result = await db.query(sql, vars);

    if (!result.affectedRows) throw 'An unknown error occured';

    (sql = `
      SELECT email_id as id FROM linked_modifiers WHERE modifier_id = ?
    `),
      (vars = [req.params.mod]);

    const rows = await db.query(sql, vars);
    db.release();

    res.status(200).json({ message: '' });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
