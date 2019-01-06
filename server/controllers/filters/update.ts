const requireCredits = require('lib/user/require-credits');
const validate = require('lib/filter/validate');
import { MySQL } from 'lib/MySQL';

/*
  PUT /api/6/filters/:filter
  REQUIRED
    type: number, name: string, description: string, find: string
  OPTIONAL
    acceptOnMatch: boolean, useRegex: boolean
  RETURN
    { update?: number[] }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const valid = validate(req.body);
    if (valid != 'ok') throw valid;

    await requireCredits(db, +req.session.uid);

    const [filter] = await db.query(
      `
        SELECT type, accept_on_match AS acceptOnMatch FROM filters
        WHERE filter_id = ? AND user_id = ?
      `,
      [req.params.filter, req.session.uid]
    );
    if (!filter) throw 'Could not find filter';

    const result = await db.query(
      `
        UPDATE filters SET name = ?, description = ?, type = ?, find = ?,
        accept_on_match = ?, use_regex = ?
        WHERE filter_id = ?
      `,
      [
        req.body.name,
        req.body.description,
        req.body.type,
        req.body.find,
        !!+req.body.acceptOnMatch,
        !!+req.body.useRegex,
        req.params.filter
      ]
    );
    if (!result.affectedRows) throw 'Could not update filter';

    const rows = await db.query(
      `SELECT email_id AS id FROM linked_filters WHERE filter_id = ?`,
      [req.params.filter]
    );

    /** @type {number[]} */
    let update = [];

    if (rows.length) {
      const emails = rows.map(email => email.id);

      if (
        // Determine if MailGun routes need to be updated
        ([1, 2, 3, 6].indexOf(filter.type) > -1 && !!+filter.acceptOnMatch) ||
        ([1, 2, 3, 6].indexOf(+req.body.type) > -1 && req.body.acceptOnMatch)
      )
        update = emails;
    }

    res.status(200).json({ update });
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
};
