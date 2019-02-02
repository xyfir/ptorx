import { NextFunction, Response, Request } from 'express';
import { editModifier } from 'lib/modifiers/edit';

export function api_editModifier(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  editModifier(req.body, req.jwt.userId)
    .then(modifier => res.status(200).json(modifier))
    .catch(next);
}
