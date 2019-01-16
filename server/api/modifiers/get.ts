import { Request, Response } from 'express';
import { listModifiers } from 'lib/modifiers/list';
import { getModifier } from 'lib/modifiers/get';

export async function api_getModifiers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const modifier = +req.query.modifier;
    const response = modifier
      ? await getModifier(modifier, req.session.uid)
      : await listModifiers(req.session.uid);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
