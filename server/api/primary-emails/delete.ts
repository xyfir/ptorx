import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { NextFunction, Response, Request } from 'express';

export function api_deletePrimaryEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deletePrimaryEmail(+req.query.primaryEmail, req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
