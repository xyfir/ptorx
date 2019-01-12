import { Request, Response } from 'express';
import { validateFilter } from 'lib/filters/validate';
import { MySQL } from 'lib/MySQL';

/**
 * POST /api/6/filters
 * @param {object} req
 * @param {RequestBody} req.body
 */
/**
 * @typedef {object} RequestBody
 * @prop {number} type
 * @prop {string} name
 * @prop {string} find
 * @prop {string} description
 * @prop {boolean} [regex]
 * @prop {boolean} [acceptOnMatch]
 */
/**
 * @typedef {object} RequestBody
 * @prop {string} [message]
 * @prop {number} [id]
 */
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
      description: req.body.description,
      type: req.body.type,
      find: req.body.find,
      regex: !!+req.body.regex,
      acceptOnMatch: !!+req.body.acceptOnMatch
    });
    if (!result.affectedRows) throw 'Could not create filter';

    res.status(200).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
