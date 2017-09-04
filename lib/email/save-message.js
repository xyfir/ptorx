const mysql = require('lib/mysql');

/**
 * Saves an incoming message.
 * @async
 * @param {object} req
 * @param {boolean} rejected
 */
module.exports = async function(req, rejected) {

  const db = new mysql;
  await db.getConnection();
  await db.query(`
    INSERT INTO messages SET ?
  `, {
    rejected,
    subject: req.body.subject,
    email_id: req.params.email,
    received: req.body.timestamp,
    message_url: req.body['message-url'],
    message_key: req.body['message-url'].split('/').slice(-1)[0]
  });
  db.release();

};