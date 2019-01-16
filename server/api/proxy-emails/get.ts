import { Request, Response } from 'express';
import { listProxyEmails } from 'lib/proxy-emails/list';
import { getProxyEmail } from 'lib/proxy-emails/get';

export async function api_getProxyEmails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const proxyEmail = +req.query.proxyEmail;
    const response = proxyEmail
      ? await getProxyEmail(proxyEmail, +req.session.uid)
      : await listProxyEmails(req.session.uid);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
