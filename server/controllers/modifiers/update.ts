const buildData = require('lib/modifier/build-data');
const validate = require('lib/modifier/validate');
import { MySQL } from 'lib/MySQL';

/*
  PUT /api/6/modifiers/:mod
  REQUIRED
    type: number, name: string, description: string
  OPTIONAL
    REPLACE
      value: string, with: string, regex: boolean
    TAG
      prepend: string, value: string
    SUBJECT
      subject: string
    CONCATENATE
      add: string, to: string, separator: string
  RETURN
    { message: string }
  DESCRIPTION
    Update a modifier's data
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    validate(req.body);

    let sql = `
      UPDATE modifiers SET name = ?, description = ?, type = ?, data = ?
      WHERE modifier_id = ? AND user_id = ?
    `,
      vars = [
        req.body.name,
        req.body.description,
        req.body.type,
        buildData(req.body),
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
};
