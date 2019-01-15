import { Request, Response } from 'express';
import { editProxyEmail } from 'lib/proxy-emails/edit';

export async function api_editProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const proxyEmail = await editProxyEmail(req.body, req.session.uid);
    res.status(200).json(proxyEmail);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
