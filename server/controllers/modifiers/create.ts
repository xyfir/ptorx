const buildData = require('lib/modifier/build-data');
const validate = require('lib/modifier/validate');
import { MySQL } from 'lib/MySQL';

export async function addModifier(req, res) {
  const db = new MySQL();

  try {
    validate(req.body);

    const sql = `
      INSERT INTO modifiers SET ?
    `,
      insert = {
        data: buildData(req.body),
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
