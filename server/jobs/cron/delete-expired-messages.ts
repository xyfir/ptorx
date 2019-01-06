import { MySQL } from 'lib/MySQL';

module.exports = async function() {
  const db = new MySQL();

  try {


    // Messages expire from MailGun after 3 days
    // These messages can no longer be accessed from the Ptorx app
    await db.query(`
      UPDATE messages
      SET message_url = ''
      WHERE received + 255600 < UNIX_TIMESTAMP() AND message_url != ''
    `);

    // Messages can no longer be replied to from outside of the Ptorx app
    // after 30 days
    await db.query(`
      DELETE FROM messages WHERE received + 2592000 < UNIX_TIMESTAMP()
    `);

    db.release();
  } catch (err) {
    db.release();
  }
};
