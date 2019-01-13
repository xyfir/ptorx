import { Request, Response } from 'express';
import { deleteModifier } from 'lib/modifiers/delete';

export async function api_deleteModifier(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteModifier(+req.params.mod, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
