import { Request, Response } from 'express';
import { listProxyEmails } from 'lib/proxy-emails/list';

export async function api_listProxyEmails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const emails = await listProxyEmails(req.session.uid);
    res.status(200).json(emails);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
