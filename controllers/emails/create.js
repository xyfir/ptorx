const validateModifiers = require('lib/email/validate-modifiers');
const buildExpression = require('lib/mg-route/build-expression');
const validateFilters = require('lib/email/validate-filters');
const buildAction = require('lib/mg-route/build-action');
const validate = require('lib/email/validate');
const generate = require('lib/email/generate');
const request = require('superagent');
const mysql = require('lib/mysql');

const config = require('config');
const mailgun = require('mailgun-js')({
  apiKey: config.keys.mailgun,
  domain: 'ptorx.com'
});

/*
  POST api/emails
  REQUIRED
    name: string, description: string, address: string, filters: string,
    modifiers: string, to: number
  OPTIONAL
    saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean,
    recaptcha: string
  RETURN
    { error: boolean, message?: string, id?: number }
  DESCRIPTION
    Creates a redirect email, its MailGun inbound route, any used links filters/modifiers
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    validate(req.body, req.session.subscription);

    await db.getConnection();

    // Load data needed for extended validation
    let sql = `
      SELECT
        emails_created, subscription, trial, (
          SELECT COUNT(email_id) FROM redirect_emails
          WHERE user_id = ? AND created >= CURDATE()
        ) AS emails_created_today
      FROM users WHERE user_id = ?
    `,
    vars = [
      req.session.uid,
      req.session.uid
    ],
    rows = await db.query(sql, vars);

    if (!rows.length) {
      throw 'An unknown error occured-';
    }
    else if (Date.now() > rows[0].subscription) {
      throw 'You do not have a subscription';
    }
    else if (rows[0].trial) {
      if (rows[0].emails_created_today >= 5)
        throw 'Trial users can only create 5 emails per day';
      else if (rows[0].emails_created >= 15)
        throw 'Trial users can only create 15 emails total';
    }
    else if (rows[0].emails_created_today >= 20) {
      throw 'You can only create up to 20 emails per day.';
    }
    // Validate captcha
    else if (rows[0].trial) {
      const recaptchaRes = await request
        .post('https://www.google.com/recaptcha/api/siteverify')
        .send({
          secret: config.keys.recaptcha,
          response: req.body.recaptcha,
          remoteip: req.ip
        });

      if (!recaptchaRes.body.success) throw 'Invalid captcha'
    }

    let email = ''; // proxy email address

    // Generate an available address
    if (req.body.address == '') {
      email = await generate(db);
    }
    // Make sure address exists
    else {
      sql = `
        SELECT email_id FROM redirect_emails WHERE address = ?
      `,
      vars = [
        req.body.address
      ],
      rows = await db.query(sql, vars);

      if (rows.length) throw 'That email address is already in use';

      email = req.body.address;
    }

    sql = `
      SELECT email_id FROM main_emails
      WHERE email_id = ? AND user_id = ?
    `,
    vars = [
      req.body.to, req.session.uid
    ],
    rows = await db.query(sql, vars);

    // 'To' email does not exist and user is not using a 'to' address
    if (!rows.length && !req.body.noToAddress)
      throw 'Could not find main email';

    const data = {
      description: req.body.description,
      spam_filter: !req.body.noSpamFilter,
      save_mail: req.body.saveMail,
      to_email: (req.body.noToAddress ? 0 : rows[0].email_id),
      user_id: req.session.uid,
      name: req.body.name, address: email
    },
    modifiers = req.body.modifiers
      ? req.body.modifiers.split(',').map(Number) : [],
    filters = req.body.filters
      ? req.body.filters.split(',').map(Number) : [];

    await validateFilters(filters, req.session.uid, db);
    await validateModifiers(modifiers, req.session.uid, db);

    let dbRes;

    sql = `
      INSERT INTO redirect_emails SET ?
    `,
    dbRes = await db.query(sql, data);

    if (!dbRes.affectedRows) throw 'An unknown error occured--';

    const id = dbRes.insertId;

    // Build MailGun route expression(s)
    const expression = await buildExpression({
      address: data.address, filters,
      saveMail: data.save_mail || data.to_email == 0
    }, db);

    // Create Mailgun route
    const mgRes = await mailgun.routes().create({
      priority: (data.spam_filter ? 2 : 0), description: '',
      expression, action: buildAction({
        id, save: data.to_email == 0 || data.save_mail
      })
    });

    // Save MailGun route ID to proxy email
    sql = `
      UPDATE redirect_emails SET mg_route_id = ?
      WHERE email_id = ?
    `,
    vars = [
      mgRes.route.id,
      id
    ],
    dbRes = await db.query(sql, vars);

    if (filters.length) {
      sql = // Link filters to email
        'INSERT INTO linked_filters (filter_id, email_id) VALUES ' +
        filters.map(f => `('${f}', '${id}')`).join(', '),
      dbRes = await db.query(sql);
    }

    if (modifiers.length) {
      sql = // Link modifiers to email
        'INSERT INTO linked_modifiers ' +
        '(modifier_id, email_id, order_number) VALUES ' +
        modifiers.map((m, i) =>`('${m}', '${id}', '${i}')`).join(', '),
      dbRes = await db.query(sql);
    }

    // Increment emails_created
    sql = `
      UPDATE users SET emails_created = emails_created + 1
      WHERE user_id = ?
    `,
    vars = [
      req.session.uid
    ],
    dbRes = await db.query(sql, vars);
    db.release();

    res.json({ error: false, id });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};