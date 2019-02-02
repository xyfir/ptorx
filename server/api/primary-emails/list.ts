import { listPrimaryEmails } from 'lib/primary-emails/list';
import { NextFunction, Response, Request } from 'express';

export function api_listPrimaryEmails(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  listPrimaryEmails(req.jwt.userId)
    .then(primaryEmails => res.status(200).json(primaryEmails))
    .catch(next);
}
