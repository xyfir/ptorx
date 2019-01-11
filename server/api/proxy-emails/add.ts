import { validateProxyEmailModifiers } from 'lib/proxy-emails/validate-modifiers';
import { buildMailgunRouteExpression } from 'lib/mg-routes/build-expression';
import { validateProxyEmailFilters } from 'lib/proxy-emails/validate-filters';
import { buildMailgunRouteAction } from 'lib/mg-routes/build-action';
import { generateProxyAddress } from 'lib/proxy-emails/generate';
import { validateProxyEmail } from 'lib/proxy-emails/validate';
import { requireCredits } from 'lib/users/require-credits';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_addProxyEmail(req, res) {
  const db = new MySQL();

  try {
    validateProxyEmail(req.body);

    await requireCredits(db, +req.session.uid);

    // Load data needed for extended validation
    let sql = `
      SELECT
        emails_created AS emailsCreated,
        (
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
        req.body.domain,
        req.body.domain,
        req.session.uid,
        req.session.uid
      ],
      rows = await db.query(sql, vars);

    if (!rows.length) throw 'Could not find user';
    if (!rows[0].domain) throw 'Invalid / unverified / unauthorized domain';

    let address = ''; // proxy email address without @domain.com
    const { domain } = rows[0];

    // Generate an available address
    if (req.body.address == '') {
      address = await generateProxyAddress(db, req.body.domain);
    }
    // Make sure address exists
    else {
      sql = `
        SELECT email_id FROM proxy_emails
        WHERE address = ? AND domain_id = ?
      `;
      vars = [req.body.address, req.body.domain];
      rows = await db.query(sql, vars);

      if (rows.length) throw 'That email address is already in use';

      address = req.body.address;
    }

    sql = `
      SELECT email_id, address FROM primary_emails
      WHERE email_id = ? AND user_id = ?
    `;
    vars = [req.body.to, req.session.uid];
    rows = await db.query(sql, vars);

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
    };
    const modifiers =
      typeof req.body.modifiers == 'string'
        ? req.body.modifiers
            .split(',')
            .filter(f => f)
            .map(Number)
        : req.body.modifiers || [];
    const filters =
      typeof req.body.filters == 'string'
        ? req.body.filters
            .split(',')
            .filter(f => f)
            .map(Number)
        : req.body.filters || [];

    await validateProxyEmailFilters(
      filters,
      req.session.uid,
      data.direct_forward,
      db
    );
    await validateProxyEmailModifiers(
      modifiers,
      req.session.uid,
      data.direct_forward,
      db
    );

    let dbRes;

    sql = `
      INSERT INTO proxy_emails SET ?
    `;
    dbRes = await db.query(sql, data);

    if (!dbRes.affectedRows) throw 'An unknown error occured--';

    const id = dbRes.insertId;

    // Build Mailgun route expression(s)
    const expression = await buildMailgunRouteExpression(db, {
      saveMail: data.save_mail,
      address: data.address + '@' + domain,
      filters
    });

    // Build Mailgun route action(s)
    const action = buildMailgunRouteAction(
      req.body.directForward
        ? { id, address: rows[0].address }
        : { id, save: data.save_mail }
    );

    const mailgun = Mailgun({ apiKey: CONFIG.MAILGUN_KEY, domain });

    // Create Mailgun route
    // @ts-ignore
    const mgRes = await mailgun.routes().create({
      description: 'Ptorx ' + CONFIG.PROD ? 'prod' : 'dev',
      expression,
      priority: data.spam_filter && !data.save_mail ? 3000 : 1000,
      action
    });

    // Save Mailgun route ID to proxy email
    sql = `
      UPDATE proxy_emails SET mg_route_id = ?
      WHERE email_id = ?
    `;
    vars = [mgRes.route.id, id];
    dbRes = await db.query(sql, vars);

    if (filters.length) {
      sql = // Link filters to email
        'INSERT INTO linked_filters (filter_id, email_id) VALUES ' +
        filters.map(f => `('${f}', '${id}')`).join(', ');
      dbRes = await db.query(sql);
    }

    if (modifiers.length) {
      sql = // Link modifiers to email
        'INSERT INTO linked_modifiers ' +
        '(modifier_id, email_id, order_number) VALUES ' +
        modifiers.map((m, i) => `('${m}', '${id}', '${i}')`).join(', ');
      dbRes = await db.query(sql);
    }

    // Increment emails_created
    sql = `
      UPDATE users SET emails_created = emails_created + 1
      WHERE user_id = ?
    `;
    vars = [req.session.uid];
    dbRes = await db.query(sql, vars);

    res.status(200).json({ id });
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
}
