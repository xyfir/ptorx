import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getModifier(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [modifier] = await db.query(
      `
      SELECT
        modifierId AS id, name, description, type, data
      FROM modifiers
      WHERE modifierId = ? AND userId = ?
    `,
      [req.params.mod, req.session.uid]
    );
    if (!modifier) throw 'Could not find modifier';

    modifier.linkedTo = await db.query(
      `
    SELECT
      proxyEmailId AS id, CONCAT(pxe.address, '@', d.domain) AS address
    FROM
      proxy_emails AS pxe, domains AS d
    WHERE
      pxe.proxyEmailId IN (
        SELECT proxyEmailId FROM links WHERE modifierId = ?
      ) AND d.id = pxe.domainId
    `,
      [req.params.mod]
    );
    db.release();

    res.status(200).json(modifier);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
