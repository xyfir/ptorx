import { Request, Response } from 'express';
import { getDomain } from 'lib/domains/get';

export async function api_getDomain(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domain = await getDomain(+req.params.domain, req.session.uid);
    res.status(200).json(domain);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
