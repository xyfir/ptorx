const config = require('config');

/**
 * @typedef {object} BuildActionOptions
 * @prop {string} [address] - An email address to forward mail to. Only used
 * if user enables `direct forward` on the proxy email.
 * @prop {number} [id] - A proxy email id.
 * @prop {boolean} [save] - Whether the mail should be saved or not.
 */

/**
 * Build the `action` field for the proxy email's Mailgun route.
 * @param {BuildActionOptions} options
 * @return {string}
 */
module.exports = function(options) {
  if (options.address) return `forward("${options.address}")`;

  // Receive routes need their own unique domain in dev
  // When in prod it is the same as config.addresses.ptorx.root
  const url = config.addresses.ptorx.callback + 'api/receive/' + options.id;

  if (options.save) return `store(notify="${url}")`;
  else return `forward("${url}")`;
};
