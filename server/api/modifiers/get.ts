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
    ? getModifier(modifierId, req.session.uid)
        .then(modifier => res.status(200).json(modifier))
        .catch(next)
    : listModifiers(req.session.uid)
        .then(modifiers => res.status(200).json(modifiers))
        .catch(next);
}
