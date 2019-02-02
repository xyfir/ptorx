import { getMessageAttachmentBin } from 'lib/messages/get';
import { NextFunction, Response, Request } from 'express';

export function api_getMessageAttachmentBin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  getMessageAttachmentBin(+req.query.attachment, req.jwt.userId)
    .then(bin => res.status(200).send(bin))
    .catch(next);
}
