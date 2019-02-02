import { NextFunction, Response, Request } from 'express';
import { listFilters } from 'lib/filters/list';
import { getFilter } from 'lib/filters/get';

export function api_getFilters(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const filterId = +req.query.filter;
  filterId
    ? getFilter(filterId, req.jwt.userId)
        .then(filter => res.status(200).json(filter))
        .catch(next)
    : listFilters(req.jwt.userId)
        .then(filters => res.status(200).json(filters))
        .catch(next);
}
