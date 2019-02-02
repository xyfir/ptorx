import { NextFunction, Response, Request } from 'express';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { getProxyEmail } from 'lib/proxy-emails/get';

export function api_getProxyEmails(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const proxyEmailId = +req.query.proxyEmail;
  proxyEmailId
    ? getProxyEmail(proxyEmailId, req.jwt.userId)
        .then(proxyEmail => res.status(200).json(proxyEmail))
        .catch(next)
    : listProxyEmails(req.jwt.userId)
        .then(proxyEmails => res.status(200).json(proxyEmails))
        .catch(next);
}
