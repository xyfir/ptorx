import { NextFunction, Response, Request } from 'express';
import { deleteProxyEmail } from 'lib/proxy-emails/delete';

export function api_deleteProxyEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteProxyEmail(+req.query.proxyEmail, +req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
