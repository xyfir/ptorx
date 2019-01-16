import { Request, Response } from 'express';
import { replyToMessage } from 'lib/messages/reply';

export async function api_replyToMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await replyToMessage(req.params.message, req.body.content, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
