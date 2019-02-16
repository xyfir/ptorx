import { NextFunction, Response, Request } from 'express';
import { startPayment } from 'lib/payments/start';

export function api_startPayment(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  startPayment(req.body, req.jwt && req.jwt.userId)
    .then(data => res.status(200).json(data))
    .catch(next);
}
