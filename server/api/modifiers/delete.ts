import { NextFunction, Response, Request } from 'express';
import { deleteModifier } from 'lib/modifiers/delete';

export function api_deleteModifier(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteModifier(+req.query.modifier, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
