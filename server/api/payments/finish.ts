import { NextFunction, Response, Request } from 'express';
import { finishPayment } from 'lib/payments/pay';

export function api_finishPayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  finishPayment(req.body.jwt, req.jwt && req.jwt.userId)
    .then(() => res.status(200).json({}))
    .catch(next);
}
