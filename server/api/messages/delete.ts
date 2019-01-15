import { Request, Response } from 'express';
import { deleteMessage } from 'lib/messages/delete';

export async function api_deleteMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteMessage(req.params.message, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
