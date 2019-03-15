import { NextFunction, Response, Request } from 'express';
import { addAlias } from 'lib/aliases/add';

export function api_addAlias(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addAlias(req.body, req.jwt.userId)
    .then(alias => res.status(200).json(alias))
    .catch(next);
}
