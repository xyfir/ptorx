import { Request, Response } from 'express';
import { deleteDomainUser } from 'lib/domains/users/delete';

export async function api_deleteDomainUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteDomainUser(+req.params.domain, req.params.key, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
