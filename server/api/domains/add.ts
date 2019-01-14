import { Request, Response } from 'express';
import { addDomain } from 'lib/domains/add';

export async function api_addDomain(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domain = await addDomain(req.body, req.session.uid);
    res.status(200).json(domain);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
