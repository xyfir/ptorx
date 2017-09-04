const deleteEmail = require('controllers/emails/delete');
const mysql = require('lib/mysql');

/**
 * 'Delete' all proxy emails owned by a user with an expired subscription. 
 * *Warning* This task was not built with performance in mind.
 */
module.exports = async function() {

  const db = new mysql;

  try {
    await db.getConnection();
    const emails = await db.query(`
      SELECT
        re.email_id AS id, re.user_id AS uid
      FROM
        redirect_emails AS re, users AS u
      WHERE
        u.subscription < UNIX_TIMESTAMP() * 1000 AND u.user_id != 0 AND
        re.user_id = u.user_id
    `);
    db.release();

    for (let email of emails) {
      await deleteEmail(
        { params: { email: email.id }, session: { uid: email.uid } },
        { json: () => 1 }
      );
    }
  }
  catch (err) {
    db.release();
  }

}