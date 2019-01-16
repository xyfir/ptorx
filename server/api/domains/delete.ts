import { Request, Response } from 'express';
import { deleteDomain } from 'lib/domains/delete';

export async function api_deleteDomain(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteDomain(+req.query.domain, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
