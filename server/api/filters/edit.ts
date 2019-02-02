import { NextFunction, Response, Request } from 'express';
import { editFilter } from 'lib/filters/edit';

export function api_editFilter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editFilter(req.body, req.jwt.userId)
    .then(filter => res.status(200).json(filter))
    .catch(next);
}
