import { Request, Response } from 'express';
import { listDomains } from 'lib/domains/list';

export async function api_listDomains(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domains = await listDomains(req.session.uid);
    res.status(200).json(domains);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
