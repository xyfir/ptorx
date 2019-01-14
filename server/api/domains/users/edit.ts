import { Request, Response } from 'express';
import * as moment from 'moment';
import { MySQL } from 'lib/MySQL';

export async function api_editDomainUser(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const result = await db.query(
      `
        UPDATE domain_users SET
          label = ?, created = ?, authorized = 1
        WHERE
          domainId = ? AND requestKey = ? AND
          (SELECT userId FROM domains WHERE id = ?) = ?
      `,
      [
        req.body.label,
        moment().unix(),
        req.params.domain,
        req.body.key,
        req.params.domain,
        req.session.uid
      ]
    );
    db.release();

    if (!result.affectedRows) throw 'Could not add user to domain';

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
