/**
 * Return a proxy email's full data.
 * @param {object} db
 * @param {GetEmailOptions} opt
 * @return {ProxyEmail}
 */
/**
 * @typedef {object} GetEmailOptions
 * @prop {number} email
 * @prop {number} user
 */
/**
 * @typedef {object} ProxyEmail
 * @prop {number} id
 * @prop {string} name
 * @prop {string} address - `"address@domain"`
 * @prop {string} toEmail
 * @prop {string} description
 * @prop {boolean} saveMail
 * @prop {boolean} spamFilter
 * @prop {boolean} directForward
 * @prop {LinkedFilter[]} filters
 * @prop {LinkedModifier[]} modifiers
 */
export async function getProxyEmail(db, opt) {
  const [row] = await db.query(
    `
      SELECT
        pxe.email_id AS id, pxe.name, pxe.description, pxe.save_mail AS saveMail,
        CONCAT(pxe.address, '@', d.domain) AS address, pme.address AS toEmail,
        pxe.spam_filter AS spamFilter, pxe.direct_forward AS directForward
      FROM
        proxy_emails AS pxe, primary_emails AS pme, domains AS d
      WHERE
        pxe.email_id = ? AND pxe.user_id = ? AND
        pme.email_id = pxe.primary_email_id AND
        d.id = pxe.domain_id
    `,
    [opt.email, opt.user]
  );
  /** @type {ProxyEmail} */
  const email = row;

  if (!email || email.toEmail == null) throw 'Could not find email';

  email.saveMail = !!email.saveMail;
  email.spamFilter = !!email.spamFilter;
  email.directForward = !!email.directForward;

  // Grab basic info for all filters linked to email
  email.filters = await db.query(
    `
      SELECT filter_id AS id, name, description, type
      FROM filters WHERE filter_id IN (
        SELECT filter_id FROM linked_filters WHERE email_id = ?
      )
    `,
    [opt.email]
  );

  // Grab basic info for all modifiers linked to email
  email.modifiers = await db.query(
    `
      SELECT
        modifiers.modifier_id AS id, modifiers.name,
        modifiers.description, modifiers.type
      FROM
        modifiers, linked_modifiers
      WHERE
        modifiers.modifier_id = linked_modifiers.modifier_id
        AND linked_modifiers.email_id = ?
      ORDER BY linked_modifiers.order_number
    `,
    [opt.email]
  );

  return email;
}
