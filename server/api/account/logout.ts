import { Request, Response } from 'express';
import * as CONFIG from 'constants/config';

export function logout(req: Request, res: Response): void {
  req.session.destroy(() => res.redirect(CONFIG.PTORX_URL));
}
