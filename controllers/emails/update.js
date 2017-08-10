const validateModifiers = require('lib/email/validate-modifiers');
const buildExpression = require('lib/mg-route/build-expression');
const validateFilters = require('lib/email/validate-filters');
const buildAction = require('lib/mg-route/build-action');
const clearCache = require('lib/email/clear-cache');
const validate = require('lib/email/validate');
const mysql = require('lib/mysql');

const config = require('config');
const mailgun = require('mailgun-js')({
  apiKey: config.keys.mailgun,
  domain: 'ptorx.com'
});

/*
  PUT api/emails/:email
  REQUIRED
    name: string, description: string, filters: string,
    modifiers: string, to: number
  OPTIONAL
    saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean,
    directForward: boolean
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Updates a redirect email, linked entries, and MailGun route
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    validate(req.body, req.session.subscription);

    await db.getConnection();

    let sql = `
      SELECT
        mg_route_id AS mgRouteId, address, (
          SELECT address FROM main_emails
          WHERE email_id = ? AND user_id = ?
        ) AS toEmail
      FROM redirect_emails
      WHERE email_id = ? AND user_id = ?
    `,
    vars = [
      req.body.to, req.session.uid,
      req.params.email, req.session.uid
    ],
    rows = await db.query(sql, vars);

    const { mgRouteId, address, toEmail } = rows[0];

    // toEmail doesn't exist and user didn't provide noToAddress
    if (!toEmail && !req.body.noToAddress)
        throw 'Could not find main email';
    // Redirect email doesn't exist
    if (!address)
      throw 'Could not find redirect email';
    
    // Validate filters and modifiers
    const modifiers = req.body.modifiers
      ? req.body.modifiers.split(',').map(Number) : [];
    const filters = req.body.filters
      ? req.body.filters.split(',').map(Number) : [];

    await validateModifiers(
      modifiers, req.session.uid, req.body.directForward, db
    );
    await validateFilters(
      filters, req.session.uid, req.body.directForward, db
    );

    // Update values in redirect_emails
    sql = `
      UPDATE redirect_emails SET
        to_email = ?, name = ?,
        description = ?, save_mail = ?,
        direct_forward = ?, spam_filter = ?
      WHERE email_id = ?
    `,
    vars = [
      req.body.noToAddress ? 0 : req.body.to, req.body.name,
      req.body.description, req.body.saveMail,
      req.body.directForward, !req.body.noSpamFilter,
      req.params.email
    ];
    let dbRes = await db.query(sql, vars);

    if (!dbRes.affectedRows) throw 'An unknown error occured';

    // Build Mailgun route expression(s)
    const expression = await buildExpression({
      address, filters,
      saveMail: req.body.saveMail || !req.body.to
    }, db);

    // Build Mailgun route action(s)
    const action = buildAction(
      req.body.directForward
        ? { address: toEmail }
        : { id: req.params.email, save: req.body.saveMail || !req.body.to }
    )

    // Update MailGun route
    await mailgun.routes(mgRouteId).update({
      description: '',
      expression,
      priority: (!req.body.noSpamFilter ? 2 : 0),
      action
    });

    // Delete all filters
    sql = `
      DELETE FROM linked_filters WHERE email_id = ?
    `,
    vars = [
      req.params.email
    ],
    dbRes = await db.query(sql, vars);

    // Delete all modifiers since the order may have changed
    sql = `
      DELETE FROM linked_modifiers WHERE email_id = ?
    `,
    vars = [
      req.params.email
    ],
    dbRes = await db.query(sql, vars);

    // Insert modifiers
    if (modifiers.length) {
      sql =
        'INSERT INTO linked_modifiers ' +
        '(modifier_id, email_id, order_number) VALUES ' +
        modifiers
          .map((m, i) => `('${m}', '${+req.params.email}', '${i}')`)
          .join(', '),
      dbRes = await db.query(sql);
    }

    // Insert filters
    if (filters.length) {
      sql =
        'INSERT INTO linked_filters (filter_id, email_id) VALUES ' +
        filters.map(f =>`('${f}', '${+req.params.email}')`).join(', '),
      dbRes = await db.query(sql);
    }

    db.release();
    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};