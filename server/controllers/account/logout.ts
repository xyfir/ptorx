import * as CONFIG from 'constants/config';

/*
  GET api/account/logout
*/
module.exports = function(req, res) {
  req.session.destroy(() => res.redirect(CONFIG.PTORX_URL));
};
