import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';

/**
 * @async
 * @param {object} db
 * @param {number} email
 * @param {number} user
 * @throws {string}
 */
export async function deleteProxyEmail(db, email, user) {
  const [row] = await db.query(
    `
      SELECT
        pxe.mg_route_id AS mgRouteId, d.domain
      FROM
        proxy_emails AS pxe, domains AS d
      WHERE
        pxe.email_id = ? AND pxe.user_id = ? AND d.id = pxe.domain_id
    `,
    [email, user]
  );

  if (!row) throw 'Could not find email';

  // Remove any information that could be linked to the creator
  // Keep in database so that a 'deleted' proxy email cannot be created again
  await db.query(
    `
      UPDATE proxy_emails SET
        user_id = NULL, primary_email_id = NULL, name = NULL,
        description = NULL, mg_route_id = NULL
      WHERE email_id = ?
    `,
    [email]
  );

  if (row.mgRouteId) {
    const mailgun = Mailgun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain: row.domain
    });
    await mailgun.routes(row.mgRouteId).delete();
  }

  // Because proxy email is not actually getting deleted and thus won't
  // trigger a foreign key ON DELETE CASCADE we must manually remove the
  // linked filters and modifiers
  await db.query('DELETE FROM linked_filters WHERE email_id = ?', [email]);
  await db.query('DELETE FROM linked_modifiers WHERE email_id = ?', [email]);
}
