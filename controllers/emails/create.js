const validateModifiers = require('lib/email/validate-modifiers');
const buildExpression = require('lib/mg-route/build-expression');
const validateFilters = require('lib/email/validate-filters');
const buildAction = require('lib/mg-route/build-action');
const validate = require('lib/email/validate');
const generate = require('lib/email/generate');
const MailGun = require('mailgun-js');
const request = require('superagent');
const config = require('config');
const mysql = require('lib/mysql');

/*
  POST api/emails
  REQUIRED
    name: string, description: string, address: string, domain: number,
    filters: string, modifiers: string, to: number
  OPTIONAL
    saveMail: boolean, noSpamFilter: boolean, noToAddress: boolean,
    directForward: boolean, recaptcha: string
  RETURN
    { error: boolean, message?: string, id?: number }
  DESCRIPTION
    Creates a redirect email, its MailGun inbound route, any used links filters/modifiers
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    validate(req.body, req.session.subscription);

    await db.getConnection();

    // Load data needed for extended validation
    let sql = `
      SELECT
        emails_created AS emailsCreated, subscription, trial, (
          SELECT COUNT(email_id) FROM proxy_emails
          WHERE user_id = ? AND created >= CURDATE()
        ) AS emailsCreatedToday, (
          SELECT domain FROM domains
          WHERE id = ? AND verified = 1 AND (
            global = 1 OR id IN(
              SELECT domain_id FROM domain_users
              WHERE domain_id = ? AND user_id = ? AND authorized = 1
            )
          )
        ) AS domain
      FROM users WHERE user_id = ?
    `,
      vars = [
        req.session.uid,
        req.body.domain,
        req.body.domain,
        req.session.uid,
        req.session.uid
      ],
      rows = await db.query(sql, vars);

    if (!rows.length) {
      throw 'An unknown error occured-';
    } else if (Date.now() > rows[0].subscription) {
      throw 'You do not have a subscription';
    } else if (!rows[0].domain) {
      throw 'Invalid / unverified / unauthorized domain';
    } else if (rows[0].trial) {
      if (rows[0].emailsCreatedToday >= 5)
        throw 'Trial users can only create 5 emails per day';
      else if (rows[0].emailsCreated >= 15)
        throw 'Trial users can only create 15 emails total';

      // Validate captcha
      const recaptchaRes = await request
        .post('https://www.google.com/recaptcha/api/siteverify')
        .type('form')
        .send({
          secret: config.keys.recaptcha,
          response: req.body.recaptcha,
          remoteip: req.ip
        });

      if (!recaptchaRes.body.success) throw 'Invalid captcha';
    } else if (rows[0].emailsCreatedToday >= 20) {
      throw 'You can only create up to 20 emails per day.';
    }

    let address = ''; // proxy email address without @domain.com
    const { domain } = rows[0];

    // Generate an available address
    if (req.body.address == '') {
      address = await generate(db, req.body.domain);
    }
    // Make sure address exists
    else {
      (sql = `
        SELECT email_id FROM proxy_emails
        WHERE address = ? AND domain_id = ?
      `),
        (vars = [req.body.address, req.body.domain]),
        (rows = await db.query(sql, vars));

      if (rows.length) throw 'That email address is already in use';

      address = req.body.address;
    }

    (sql = `
      SELECT email_id, address FROM primary_emails
      WHERE email_id = ? AND user_id = ?
    `),
      (vars = [req.body.to, req.session.uid]),
      (rows = await db.query(sql, vars));

    // 'To' email does not exist and user is not using a 'to' address
    if (!rows.length && !req.body.noToAddress)
      throw 'Could not find main email';

    const data = {
        primary_email_id: req.body.noToAddress ? 0 : rows[0].email_id,
        direct_forward: req.body.directForward,
        description: req.body.description,
        spam_filter: !req.body.noSpamFilter,
        save_mail: req.body.saveMail || req.body.noToAddress,
        domain_id: req.body.domain,
        user_id: req.session.uid,
        address,
        name: req.body.name
      },
      modifiers = req.body.modifiers
        ? req.body.modifiers.split(',').map(Number)
        : [],
      filters = req.body.filters ? req.body.filters.split(',').map(Number) : [];

    await validateFilters(filters, req.session.uid, data.direct_forward, db);
    await validateModifiers(
      modifiers,
      req.session.uid,
      data.direct_forward,
      db
    );

    let dbRes;

    (sql = `
      INSERT INTO proxy_emails SET ?
    `),
      (dbRes = await db.query(sql, data));

    if (!dbRes.affectedRows) throw 'An unknown error occured--';

    const id = dbRes.insertId;

    // Build MailGun route expression(s)
    const expression = await buildExpression(
      {
        saveMail: data.save_mail,
        address: data.address + '@' + domain,
        filters
      },
      db
    );

    // Build Mailgun route action(s)
    const action = buildAction(
      req.body.directForward
        ? { address: rows[0].address }
        : { id, save: data.save_mail }
    );

    const mailgun = MailGun({ apiKey: config.keys.mailgun, domain });

    // Create Mailgun route
    const mgRes = await mailgun.routes().create({
      description: 'Ptorx ' + config.environment.type,
      expression,
      priority: data.spam_filter && !data.save_mail ? 3000 : 1000,
      action
    });

    // Save MailGun route ID to proxy email
    (sql = `
      UPDATE proxy_emails SET mg_route_id = ?
      WHERE email_id = ?
    `),
      (vars = [mgRes.route.id, id]),
      (dbRes = await db.query(sql, vars));

    if (filters.length) {
      (sql = // Link filters to email
        'INSERT INTO linked_filters (filter_id, email_id) VALUES ' +
        filters.map(f => `('${f}', '${id}')`).join(', ')),
        (dbRes = await db.query(sql));
    }

    if (modifiers.length) {
      (sql = // Link modifiers to email
        'INSERT INTO linked_modifiers ' +
        '(modifier_id, email_id, order_number) VALUES ' +
        modifiers.map((m, i) => `('${m}', '${id}', '${i}')`).join(', ')),
        (dbRes = await db.query(sql));
    }

    // Increment emails_created
    (sql = `
      UPDATE users SET emails_created = emails_created + 1
      WHERE user_id = ?
    `),
      (vars = [req.session.uid]),
      (dbRes = await db.query(sql, vars));
    db.release();

    res.json({ error: false, id });
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
