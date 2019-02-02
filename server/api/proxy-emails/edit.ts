import { NextFunction, Response, Request } from 'express';
import { editProxyEmail } from 'lib/proxy-emails/edit';

export function api_editProxyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editProxyEmail(req.body, req.jwt.userId)
    .then(proxyEmail => res.status(200).json(proxyEmail))
    .catch(next);
}
