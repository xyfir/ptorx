import { NextFunction, Response, Request } from 'express';
import { setPGPKeys } from 'lib/users/set-keys';

export function api_setPGPKeys(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  setPGPKeys(req.body.privateKey, req.body.publicKey, req.jwt.userId)
    .then(user => res.status(200).json(user))
    .catch(next);
}
