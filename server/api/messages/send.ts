import { NextFunction, Response, Request } from 'express';
import { sendMessage } from 'lib/messages/send';

export function api_sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  sendMessage(req.body, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
