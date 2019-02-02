import { NextFunction, Response, Request } from 'express';
import { listMessages } from 'lib/messages/list';
import { getMessage } from 'lib/messages/get';

export function api_getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const messageId = +req.query.message;
  messageId
    ? getMessage(messageId, req.jwt.userId)
        .then(message => res.status(200).json(message))
        .catch(next)
    : listMessages(req.jwt.userId)
        .then(messages => res.status(200).json(messages))
        .catch(next);
}
