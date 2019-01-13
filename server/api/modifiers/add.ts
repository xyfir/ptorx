import { Request, Response } from 'express';
import { addModifier } from 'lib/modifiers/add';

export async function api_addModifier(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const modifier = await addModifier(req.body, req.session.uid);
    res.status(200).json(modifier);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
