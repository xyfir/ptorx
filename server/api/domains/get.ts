import { Request, Response } from 'express';
import { listDomains } from 'lib/domains/list';
import { getDomain } from 'lib/domains/get';

export async function api_getDomains(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domain = +req.query.domain;
    const response = domain
      ? await getDomain(domain, req.session.uid)
      : listDomains(req.session.uid);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
