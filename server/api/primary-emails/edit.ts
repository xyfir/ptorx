import { NextFunction, Response, Request } from 'express';
import { editPrimaryEmail } from 'lib/primary-emails/edit';

export function api_editPrimaryEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editPrimaryEmail(req.body, req.jwt.userId)
    .then(primaryEmail => res.status(200).json(primaryEmail))
    .catch(next);
}
