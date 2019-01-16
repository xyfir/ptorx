import { Request, Response } from 'express';
import { verifyDomain } from 'lib/domains/verify';

export async function api_verifyDomain(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await verifyDomain(+req.body.domainId, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
