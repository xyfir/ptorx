import { Request, Response } from 'express';
import { sendMessage } from 'lib/messages/send';

export async function api_sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await sendMessage(req.body, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
