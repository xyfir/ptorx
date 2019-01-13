import { Request, Response } from 'express';
import { editModifier } from 'lib/modifiers/edit';

export async function api_editModifier(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const modifier = await editModifier(req.body, req.session.uid);
    res.status(200).json(modifier);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
