import { Request, Response } from 'express';
import { getFilter } from 'lib/filters/get';

export async function api_getFilter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filter = await getFilter(+req.params.filter, req.session.uid);
    res.status(200).json(filter);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
