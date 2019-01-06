import { MySQL } from 'lib/MySQL';

/**
 * GET /api/filters
 */
/**
 * @typedef {object} ResponseBody
 * @prop {FilterListItem[]} filters
 */
/**
 * @typedef {object} FilterListItem
 * @prop {number} id
 * @prop {number} type
 * @prop {string} name
 * @prop {string} description
 */
module.exports = async function(req, res) {
  const db = new MySQL();
  try {
    const filters = await db.query(
      `
        SELECT filter_id as id, name, description, type
        FROM filters WHERE user_id = ?
      `,
      [req.session.uid]
    );
    res.status(200).json({ filters });
  } catch (err) {
    res.status(400).json({ message: err });
  }
  db.release();
};
