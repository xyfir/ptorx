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
        pxe.proxyEmailId AS id, pxe.name, pxe.description, pxe.saveMail AS saveMail,
        CONCAT(pxe.address, '@', d.domain) AS address, pme.address AS toEmail,
        pxe.spamFilter AS spamFilter, pxe.directForward AS directForward
      FROM
        proxy_emails AS pxe, primary_emails AS pme, domains AS d
      WHERE
        pxe.proxyEmailId = ? AND pxe.userId = ? AND
        pme.primaryEmailId = pxe.primaryEmailId AND
        d.id = pxe.domainId
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
      SELECT filterId AS id, name, description, type
      FROM filters WHERE filterId IN (
        SELECT filterId FROM links WHERE proxyEmailId = ?
      )
    `,
    [opt.email]
  );

  // Grab basic info for all modifiers linked to email
  email.modifiers = await db.query(
    `
      SELECT
        modifiers.modifierId AS id, modifiers.name,
        modifiers.description, modifiers.type
      FROM
        modifiers, links
      WHERE
        modifiers.modifierId = links.modifierId
        AND links.proxyEmailId = ?
      ORDER BY links.orderIndex
    `,
    [opt.email]
  );

  return email;
}
