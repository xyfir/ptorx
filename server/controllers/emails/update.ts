const validateModifiers = require('lib/email/validate-modifiers');
const buildExpression = require('lib/mg-route/build-expression');
const validateFilters = require('lib/email/validate-filters');
const requireCredits = require('lib/user/require-credits');
const buildAction = require('lib/mg-route/build-action');
const validate = require('lib/email/validate');
const MailGun = require('mailgun-js');
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function editProxyEmail(req, res) {
  const db = new MySQL();

  try {
    validate(req.body);

    await requireCredits(db, +req.session.uid);

    let sql = `
      SELECT
        pxe.mg_route_id AS mgRouteId, pme.address AS toEmail, d.domain,
        CONCAT(pxe.address, '@', d.domain) AS address
      FROM
        proxy_emails AS pxe, domains AS d, primary_emails AS pme
      WHERE
        pxe.email_id = ? AND
        d.id = pxe.domain_id AND
        pme.email_id = ? AND pme.user_id = ?
    `,
      vars = [req.params.email, req.body.to, req.session.uid],
      rows = await db.query(sql, vars);

    const { mgRouteId, address, toEmail, domain } = rows[0];

    // toEmail doesn't exist and user didn't provide noToAddress
    if (!toEmail && !req.body.noToAddress) throw 'Could not find main email';
    // Redirect email doesn't exist
    if (!address) throw 'Could not find redirect email';

    // Validate filters and modifiers
    const modifiers = req.body.modifiers
      ? req.body.modifiers.split(',').map(Number)
      : [];
    const filters = req.body.filters
      ? req.body.filters.split(',').map(Number)
      : [];

    await validateModifiers(
      modifiers,
      req.session.uid,
      req.body.directForward,
      db
    );
    await validateFilters(filters, req.session.uid, req.body.directForward, db);

    const saveMail = req.body.saveMail || !req.body.to;

    // Update values in proxy_emails
    sql = `
      UPDATE proxy_emails SET
        primary_email_id = ?, name = ?,
        description = ?, save_mail = ?,
        direct_forward = ?, spam_filter = ?
      WHERE email_id = ?
    `;
    vars = [
      req.body.noToAddress ? 0 : req.body.to,
      req.body.name,
      req.body.description,
      saveMail,
      req.body.directForward,
      !req.body.noSpamFilter,
      req.params.email
    ];
    let dbRes = await db.query(sql, vars);

    if (!dbRes.affectedRows) throw 'An unknown error occured';

    // Build Mailgun route expression(s)
    const expression = await buildExpression(db, {
      address,
      filters,
      saveMail
    });

    // Build Mailgun route action(s)
    const action = buildAction(
      req.body.directForward
        ? { id: req.params.email, address: toEmail }
        : { id: req.params.email, save: saveMail }
    );

    const mailgun = MailGun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain
    });

    // Update MailGun route
    await mailgun.routes(mgRouteId).update({
      description: 'Ptorx ' + CONFIG.PROD ? 'prod' : 'dev',
      expression,
      priority: !req.body.noSpamFilter && !saveMail ? 3000 : 1000,
      action
    });

    // Delete all filters
    sql = `
      DELETE FROM linked_filters WHERE email_id = ?
    `;
    vars = [req.params.email];
    dbRes = await db.query(sql, vars);

    // Delete all modifiers since the order may have changed
    sql = `
      DELETE FROM linked_modifiers WHERE email_id = ?
    `;
    vars = [req.params.email];
    dbRes = await db.query(sql, vars);

    // Insert modifiers
    if (modifiers.length) {
      sql =
        'INSERT INTO linked_modifiers ' +
        '(modifier_id, email_id, order_number) VALUES ' +
        modifiers
          .map((m, i) => `('${m}', '${+req.params.email}', '${i}')`)
          .join(', ');
      dbRes = await db.query(sql);
    }

    // Insert filters
    if (filters.length) {
      sql =
        'INSERT INTO linked_filters (filter_id, email_id) VALUES ' +
        filters.map(f => `('${f}', '${+req.params.email}')`).join(', ');
      dbRes = await db.query(sql);
    }

    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
