import { Request, Response } from 'express';
import { requireCredits } from 'lib/users/require-credits';
import { validateFilter } from 'lib/filters/validate';
import { MySQL } from 'lib/MySQL';

export async function api_editFilter(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const valid = validateFilter(req.body);
    if (valid != 'ok') throw valid;

    await requireCredits(db, +req.session.uid);

    const [filter] = await db.query(
      `
        SELECT type, acceptOnMatch AS acceptOnMatch FROM filters
        WHERE filterId = ? AND userId = ?
      `,
      [req.params.filter, req.session.uid]
    );
    if (!filter) throw 'Could not find filter';

    const result = await db.query(
      `
        UPDATE filters SET name = ?, description = ?, type = ?, find = ?,
        acceptOnMatch = ?, useRegex = ?
        WHERE filterId = ?
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
      `SELECT proxyEmailId AS id FROM links WHERE filterId = ?`,
      [req.params.filter]
    );

    /** @type {number[]} */
    let update = [];

    if (rows.length) {
      const emails = rows.map(email => email.id);

      if (
        // Determine if Mailgun routes need to be updated
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
}
