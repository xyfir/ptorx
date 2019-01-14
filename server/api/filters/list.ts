import { Request, Response } from 'express';
import { listFilters } from 'lib/filters/list';

export async function api_listFilters(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filters = await listFilters(req.session.uid);
    res.status(200).json(filters);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
