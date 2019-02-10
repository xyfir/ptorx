import { NextFunction, Response, Request } from 'express';
import { listPrimaryEmails } from 'lib/primary-emails/list';
import { getPrimaryEmail } from 'lib/primary-emails/get';

export function api_getPrimaryEmails(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const primaryEmailId = +req.query.primaryEmail;
  primaryEmailId
    ? getPrimaryEmail(primaryEmailId, req.jwt.userId)
        .then(primaryEmail => {
          delete primaryEmail.key;
          res.status(200).json(primaryEmail);
        })
        .catch(next)
    : listPrimaryEmails(req.jwt.userId)
        .then(primaryEmails => res.status(200).json(primaryEmails))
        .catch(next);
}
