import { getMessageAttachmentBin } from 'lib/messages/get';
import { Request, Response } from 'express';

export async function api_getMessageAttachmentBin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const bin = await getMessageAttachmentBin(
      +req.query.attachment,
      req.session.uid
    );
    res.status(200).send(bin);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
