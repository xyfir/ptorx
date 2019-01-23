import { NextFunction, Response, Request } from 'express';
import { replyToMessage } from 'lib/messages/reply';

export function api_replyToMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  replyToMessage(req.query.message, req.body.content, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
