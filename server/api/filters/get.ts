import { Request, Response } from 'express';
import { listFilters } from 'lib/filters/list';
import { getFilter } from 'lib/filters/get';

export async function api_getFilters(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filter = +req.query.filter;
    const response = filter
      ? await getFilter(filter, req.session.uid)
      : await listFilters(req.session.uid);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
