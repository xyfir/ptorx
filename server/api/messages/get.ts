import { Request, Response } from 'express';
import { listMessages } from 'lib/messages/list';
import { getMessage } from 'lib/messages/get';

export async function api_getMessages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { message } = req.query;
    const response = message
      ? await getMessage(message, req.session.uid)
      : await listMessages(req.session.uid);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
