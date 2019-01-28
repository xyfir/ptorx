import { NextFunction, Response, Request } from 'express';
import { addPrimaryEmail } from 'lib/primary-emails/add';

export function api_addPrimaryEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addPrimaryEmail({ address: req.body.address }, req.session.uid)
    .then(primaryEmail => res.status(200).json(primaryEmail))
    .catch(next);
}
