import { NextFunction, Response, Request } from 'express';
import { checkProxyEmail } from 'lib/proxy-emails/check';

export function api_checkProxyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  checkProxyEmail(req.body.domainId, req.body.address)
    .then(data => res.status(200).json(data))
    .catch(next);
}
