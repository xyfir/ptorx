import { Request, Response } from 'express';
import { validateModifier } from 'lib/modifiers/validate';
import * as moment from 'moment';
import { MySQL } from 'lib/MySQL';

export async function api_addModifier(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    validateModifier(req.body);

    const sql = `
      INSERT INTO modifiers SET ?
    `,
      insert = {
        userId: req.session.uid,
        name: req.body.name,
        type: req.body.type,
        created: moment().unix()
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
