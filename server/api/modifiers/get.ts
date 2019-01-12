import { Request, Response } from 'express';
import { getModifier } from 'lib/modifiers/get';

export async function api_getModifier(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const modifier = await getModifier(+req.params.mod, req.session.uid);
    res.status(200).json(modifier);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
