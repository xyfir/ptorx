import { NextFunction, Response, Request } from 'express';
import { getUser } from 'lib/users/get';

export function api_getUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getUser(req.jwt)
    .then(user => res.status(200).json(user))
    .catch(next);
}
