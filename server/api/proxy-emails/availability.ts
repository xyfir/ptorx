import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getProxyEmailAvailability(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const rows = await db.query(
      'SELECT proxyEmailId FROM proxy_emails WHERE address = ? AND domainId = ?',
      [req.query.address, req.query.domain]
    );
    db.release();

    res.status(200).json({ available: !rows.length });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
