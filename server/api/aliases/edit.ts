import { NextFunction, Response, Request } from 'express';
import { editAlias } from 'lib/aliases/edit';

export function api_editAlias(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editAlias(req.body, req.jwt.userId)
    .then(alias => res.status(200).json(alias))
    .catch(next);
}
