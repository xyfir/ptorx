import { NextFunction, Response, Request } from 'express';
import { addDomain } from 'lib/domains/add';

export function api_addDomain(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addDomain({ domain: req.body.domain }, req.jwt.userId)
    .then(domain => res.status(200).json(domain))
    .catch(next);
}
