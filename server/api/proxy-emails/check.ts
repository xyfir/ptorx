import { Request, Response } from 'express';
import { checkProxyEmail } from 'lib/proxy-emails/check';

export async function api_checkProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await checkProxyEmail(req.body.domainId, req.body.address);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
