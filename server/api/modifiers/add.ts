import { NextFunction, Response, Request } from 'express';
import { addModifier } from 'lib/modifiers/add';

export function api_addModifier(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  addModifier(req.body, req.jwt.userId)
    .then(modifier => res.status(200).json(modifier))
    .catch(next);
}
