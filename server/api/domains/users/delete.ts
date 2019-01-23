import { NextFunction, Response, Request } from 'express';
import { deleteDomainUser } from 'lib/domains/users/delete';

export function api_deleteDomainUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteDomainUser(+req.query.domain, req.query.key, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
