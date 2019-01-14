import { Request, Response } from 'express';
import { addDomainUser } from 'lib/domains/users/add';

export async function api_addDomainUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domainUser = await addDomainUser(req.body.domain, req.session.uid);
    res.status(200).json({ requestKey: domainUser.requestKey });
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
