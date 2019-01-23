import { NextFunction, Response, Request } from 'express';
import * as CONFIG from 'constants/config';

export function api_logout(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.session.destroy(() => res.redirect(CONFIG.PTORX_URL));
}
