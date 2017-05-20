const config = require('config');

/*
  GET api/account/logout
*/
module.exports = function(req, res) {

  req.session.destroy(err => res.redirect(config.addresses.ptorx));

};