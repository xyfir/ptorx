import { NextFunction, Response, Request } from 'express';

export function api_logout(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.clearCookie('jwt');
}
