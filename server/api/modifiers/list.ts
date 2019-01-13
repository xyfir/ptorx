import { Request, Response } from 'express';
import { listModifiers } from 'lib/modifiers/list';

export async function api_listModifiers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const modifiers = await listModifiers(req.session.uid);
    res.status(200).json(modifiers);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
