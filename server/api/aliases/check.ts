import { NextFunction, Response, Request } from 'express';
import { checkAlias } from 'lib/aliases/check';

export function api_checkAlias(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  checkAlias(req.body.domainId, req.body.address)
    .then(data => res.status(200).json(data))
    .catch(next);
}
