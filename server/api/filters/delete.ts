import { Request, Response } from 'express';
import { deleteFilter } from 'lib/filters/delete';

export async function api_deleteFilter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteFilter(+req.params.filter, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
