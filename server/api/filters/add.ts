import { Request, Response } from 'express';
import { addFilter } from 'lib/filters/add';

export async function api_addFilter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filter = await addFilter(req.body, req.session.uid);
    res.status(200).json(filter);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
