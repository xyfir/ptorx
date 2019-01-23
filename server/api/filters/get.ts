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
    ? getFilter(filterId, req.session.uid)
        .then(filter => res.status(200).json(filter))
        .catch(next)
    : listFilters(req.session.uid)
        .then(filters => res.status(200).json(filters))
        .catch(next);
}
