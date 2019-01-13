import { Request, Response } from 'express';
import { validateFilter } from 'lib/filters/validate';
import * as moment from 'moment';
import { MySQL } from 'lib/MySQL';

export async function api_addFilter(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const error = validateFilter(req.body);
    if (error != 'ok') throw error;

    const result = await db.query('INSERT INTO filters SET ?', {
      userId: req.session.uid,
      name: req.body.name,
      type: req.body.type,
      find: req.body.find,
      regex: !!+req.body.regex,
      acceptOnMatch: !!+req.body.acceptOnMatch,
      created: moment().unix()
    });
    if (!result.affectedRows) throw 'Could not create filter';

    res.status(200).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
