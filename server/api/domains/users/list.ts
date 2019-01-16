import { Request, Response } from 'express';
import { listDomainUsers } from 'lib/domains/users/list';

export async function api_listDomainUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const domainUsers = await listDomainUsers(
      +req.query.domain,
      req.session.uid
    );
    res.status(200).json(domainUsers);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
