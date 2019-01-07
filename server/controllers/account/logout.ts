import * as CONFIG from 'constants/config';

export function logout(req, res) {
  req.session.destroy(() => res.redirect(CONFIG.PTORX_URL));
}
