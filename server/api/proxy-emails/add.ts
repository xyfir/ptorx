import { Request, Response } from 'express';
import { addProxyEmail } from 'lib/proxy-emails/add';

export async function api_addProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const proxyEmail = await addProxyEmail(req.body, req.session.uid);
    res.status(200).json(proxyEmail);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
