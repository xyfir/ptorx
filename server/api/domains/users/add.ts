import { NextFunction, Response, Request } from 'express';
import { addDomainUser } from 'lib/domains/users/add';

export function api_addDomainUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addDomainUser(req.body.domain, req.session.uid)
    .then(domainUser =>
      res.status(200).json({ requestKey: domainUser.requestKey })
    )
    .catch(next);
}
