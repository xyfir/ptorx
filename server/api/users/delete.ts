import { NextFunction, Response, Request } from 'express';
import { deleteUser } from 'lib/users/delete';

export function api_deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  deleteUser(req.jwt.userId)
    .then(() => res.clearCookie('jwt'))
    .catch(err => console.error(err.stack))
    .finally(() => res.status(200).redirect(process.enve.WEB_URL));
}
