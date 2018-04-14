const crypto = require('crypto');

module.exports = {
  encrypt: function(value, encKey) {
    try {
      let cipher = crypto.createCipher('aes-256-ctr', encKey);
      let crypted = cipher.update(value, 'utf8', 'hex');

      crypted += cipher.final('hex');

      return crypted;
    } catch (e) {
      return '';
    }
  },

  decrypt: function(value, decKey) {
    try {
      let decipher = crypto.createDecipher('aes-256-ctr', decKey);
      let dec = decipher.update(value, 'hex', 'utf8');

      dec += decipher.final('utf8');

      return dec;
    } catch (e) {
      return '';
    }
  },

  hash: function(value, alg) {
    return crypto
      .createHash(alg)
      .update(value)
      .digest('hex');
  }
};
