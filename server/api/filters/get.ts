import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getFilter(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [filter] = await db.query(
      `
      SELECT
        filterId AS id, name, description, type, find,
        acceptOnMatch as acceptOnMatch, useRegex AS regex
      FROM filters
      WHERE filterId = ? AND userId = ?
    `,
      [req.params.filter, req.session.uid]
    );

    if (!filter) throw 'Could not find filter';

    filter.regex = !!+filter.regex;
    filter.acceptOnMatch = !!+filter.acceptOnMatch;

    filter.linkedTo = await db.query(
      `
      SELECT
        proxyEmailId AS id, CONCAT(pxe.address, '@', d.domain) AS address
      FROM
        proxy_emails AS pxe, domains AS d
      WHERE
        pxe.proxyEmailId IN (
          SELECT proxyEmailId FROM links WHERE filterId = ?
        ) AND d.id = pxe.domainId
    `,
      [req.params.filter]
    );
    db.release();

    res.status(200).json(filter);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
