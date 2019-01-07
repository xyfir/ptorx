import { deleteProxyEmail } from 'lib/email/delete';

/**
 * Delete a user from Ptorx, and all of their email routes on Mailgun.
 * @param {object} db
 * @param {number} user
 */
export async function deleteUser(db, user) {
  const emails = await db.query(
    'SELECT email_id AS id FROM proxy_emails WHERE user_id = ?',
    [user]
  );

  for (let email of emails) {
    try {
      await deleteProxyEmail(db, email.id, user);
    } catch (err) {}
  }

  await db.query('DELETE FROM users WHERE user_id = ?', user);
}
