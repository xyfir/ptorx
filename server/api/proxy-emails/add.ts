import { NextFunction, Response, Request } from 'express';
import { addProxyEmail } from 'lib/proxy-emails/add';

export function api_addProxyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addProxyEmail(req.body, req.jwt.userId)
    .then(proxyEmail => res.status(200).json(proxyEmail))
    .catch(next);
}
