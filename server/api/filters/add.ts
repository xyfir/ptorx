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
 * @prop {boolean} [useRegex]
 * @prop {boolean} [acceptOnMatch]
 */
/**
 * @typedef {object} RequestBody
 * @prop {string} [message]
 * @prop {number} [id]
 */
export async function api_addFilter(req, res) {
  const db = new MySQL();
  try {
    const error = validateFilter(req.body);
    if (error != 'ok') throw error;

    const result = await db.query('INSERT INTO filters SET ?', {
      user_id: req.session.uid,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      find: req.body.find,
      use_regex: !!+req.body.useRegex,
      accept_on_match: !!+req.body.acceptOnMatch
    });
    if (!result.affectedRows) throw 'Could not create filter';

    res.status(200).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
