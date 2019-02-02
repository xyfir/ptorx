import { NextFunction, Response, Request } from 'express';
import { addFilter } from 'lib/filters/add';

export function api_addFilter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addFilter(req.body, req.jwt.userId)
    .then(filter => res.status(200).json(filter))
    .catch(next);
}
