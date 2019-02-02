import { NextFunction, Response, Request } from 'express';
import { listModifiers } from 'lib/modifiers/list';
import { getModifier } from 'lib/modifiers/get';

export function api_getModifiers(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const modifierId = +req.query.modifier;
  modifierId
    ? getModifier(modifierId, req.jwt.userId)
        .then(modifier => res.status(200).json(modifier))
        .catch(next)
    : listModifiers(req.jwt.userId)
        .then(modifiers => res.status(200).json(modifiers))
        .catch(next);
}
