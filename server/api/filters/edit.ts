import { Request, Response } from 'express';
import { editFilter } from 'lib/filters/edit';

export async function api_editFilter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const filter = await editFilter(req.body, req.session.uid);
    res.status(200).json(filter);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
