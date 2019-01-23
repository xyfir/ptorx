import { getMessageAttachmentBin } from 'lib/messages/get';
import { NextFunction, Response, Request } from 'express';

export function api_getMessageAttachmentBin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getMessageAttachmentBin(+req.query.attachment, req.session.uid)
    .then(bin => res.status(200).send(bin))
    .catch(next);
}
