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
    ? getMessage(messageId, req.session.uid)
        .then(message => res.status(200).json(message))
        .catch(next)
    : listMessages(req.session.uid)
        .then(messages => res.status(200).json(messages))
        .catch(next);
}
