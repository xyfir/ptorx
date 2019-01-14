import { listPrimaryEmails } from 'lib/primary-emails/list';
import { Request, Response } from 'express';

export async function api_getPrimaryEmails(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const emails = await listPrimaryEmails(req.session.uid);
    res.status(200).json(emails);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
