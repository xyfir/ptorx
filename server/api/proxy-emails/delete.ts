import { Request, Response } from 'express';
import { deleteProxyEmail } from 'lib/proxy-emails/delete';

export async function api_deleteProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteProxyEmail(+req.params.email, +req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
