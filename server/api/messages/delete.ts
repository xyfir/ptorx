import { NextFunction, Response, Request } from 'express';
import { deleteMessage } from 'lib/messages/delete';

export function api_deleteMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteMessage(req.query.message, req.session.uid)
    .then(() => res.status(200).json({}))
    .catch(next);
}
