const db = require("lib/db");

module.exports = function(req, rejected) {

    // Get message's id/key from url
    req.body["message-url"] = req.body["message-url"]
        .split('/').slice(-1)[0];

    let sql = `
        INSERT INTO messages ?
    `, insert = {
        subject: req.body.subject,
        email_id: req.params.email,
        received: req.body.timestamp,
        rejected, message_key: req.body["message-url"]
    };

    db(cn => cn.query(sql, insert, (err, result) => cn.release()));

};