import { Request, Response } from 'express';
import { listMessages } from 'lib/messages/list';

export async function api_listMessages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const messages = await listMessages(req.session.uid);
    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
