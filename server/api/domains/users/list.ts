import { NextFunction, Response, Request } from 'express';
import { listDomainUsers } from 'lib/domains/users/list';

export function api_listDomainUsers(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  listDomainUsers(+req.query.domain, req.jwt.userId)
    .then(domainUsers => res.status(200).json(domainUsers))
    .catch(next);
}
