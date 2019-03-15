import { NextFunction, Response, Request } from 'express';
import { deleteAlias } from 'lib/aliases/delete';

export function api_deleteAlias(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteAlias(+req.query.alias, +req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
