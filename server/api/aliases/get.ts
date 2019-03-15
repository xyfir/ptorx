import { NextFunction, Response, Request } from 'express';
import { listAliases } from 'lib/aliases/list';
import { getAlias } from 'lib/aliases/get';

export function api_getAliases(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const aliasId = +req.query.alias;
  aliasId
    ? getAlias(aliasId, req.jwt.userId)
        .then(alias => res.status(200).json(alias))
        .catch(next)
    : listAliases(req.jwt.userId)
        .then(aliases => res.status(200).json(aliases))
        .catch(next);
}
