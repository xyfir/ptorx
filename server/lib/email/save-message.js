const mysql = require('lib/mysql');
const uuid = require('uuid/v4');

/**
 * Saves an incoming message.
 * @async
 * @param {object} req
 * @param {number} type - `0` = accepted, `1` = rejected, `2` = spam
 * @return {string} The saved message's id.
 */
module.exports = async function(req, type) {
  const db = new mysql();
  await db.getConnection();

  let tries = 0,
    id = '';

  while (tries < 3) {
    try {
      id = uuid();

      await db.query(
        `
        INSERT INTO messages SET ?
      `,
        {
          id,
          type,
          sender: req.body.sender,
          subject: req.body.subject,
          email_id: req.params.email,
          received: req.body.timestamp,
          message_url: req.body['message-url']
        }
      );
      break;
    } catch (err) {
      id = 'error';
      tries++;
    }
  }

  db.release();

  return id;
};
