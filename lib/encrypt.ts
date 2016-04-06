import crypto = require("crypto");

export = function (value: any, encKey: string): string {

    try {
        let cipher = crypto.createCipher("aes-256-ctr", encKey)
        let crypted = cipher.update(value, 'utf8', 'hex')

        crypted += cipher.final('hex');

        return crypted;
    }
    catch (e) { return ""; }

};