import { NextFunction, Response, Request } from 'express';
import { deleteDomain } from 'lib/domains/delete';

export function api_deleteDomain(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteDomain(+req.query.domain, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
