import { NextFunction, Response, Request } from 'express';
import { editDomainUser } from 'lib/domains/users/edit';

export function api_editDomainUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editDomainUser(req.body, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
