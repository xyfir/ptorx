import { NextFunction, Response, Request } from 'express';
import { deleteFilter } from 'lib/filters/delete';

export function api_deleteFilter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteFilter(+req.query.filter, req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
