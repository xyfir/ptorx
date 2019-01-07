import { buildModifierData } from 'lib/modifier/build-data';
import { validateModifier } from 'lib/modifier/validate';
import { MySQL } from 'lib/MySQL';

export async function addModifier(req, res) {
  const db = new MySQL();

  try {
    validateModifier(req.body);

    const sql = `
      INSERT INTO modifiers SET ?
    `,
      insert = {
        data: buildModifierData(req.body),
        user_id: req.session.uid,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type
      },
      result = await db.query(sql, insert);

    if (!result.affectedRows) throw 'An unknown error occured';

    db.release();
    res.status(200).json({ id: result.insertId });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
