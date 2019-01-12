import { Request, Response } from 'express';
import { getProxyEmail } from 'lib/proxy-emails/get';

export async function api_getProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const email = await getProxyEmail(+req.params.email, +req.session.uid);
    res.status(200).json(email);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
