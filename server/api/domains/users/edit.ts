import { NextFunction, Response, Request } from 'express';
import { editDomainUser } from 'lib/domains/users/edit';

export function api_editDomainUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editDomainUser(req.body, req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
