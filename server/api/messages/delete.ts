import { NextFunction, Response, Request } from 'express';
import { deleteMessage } from 'lib/messages/delete';

export function api_deleteMessage(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteMessage(req.query.message, req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
