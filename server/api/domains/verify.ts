import { NextFunction, Response, Request } from 'express';
import { verifyDomain } from 'lib/domains/verify';

export function api_verifyDomain(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  verifyDomain(+req.body.domainId, req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
