import { validateProxyEmailModifiers } from 'lib/proxy-emails/validate-modifiers';
import { buildMailgunRouteExpression } from 'lib/mg-routes/build-expression';
import { validateProxyEmailFilters } from 'lib/proxy-emails/validate-filters';
import { buildMailgunRouteAction } from 'lib/mg-routes/build-action';
import { generateProxyAddress } from 'lib/proxy-emails/generate';
import { validateProxyEmail } from 'lib/proxy-emails/validate';
import { Request, Response } from 'express';
import { requireCredits } from 'lib/users/require-credits';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_addProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    validateProxyEmail(req.body);

    await requireCredits(db, +req.session.uid);

    // Load data needed for extended validation
    let sql = `
      SELECT
        emailsCreated AS emailsCreated,
        (
          SELECT domain FROM domains
          WHERE id = ? AND verified = 1 AND (
            global = 1 OR id IN(
              SELECT domainId FROM domain_users
              WHERE domainId = ? AND userId = ? AND authorized = 1
            )
          )
        ) AS domain
      FROM users WHERE userId = ?
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
        SELECT proxyEmailId FROM proxy_emails
        WHERE address = ? AND domainId = ?
      `;
      vars = [req.body.address, req.body.domain];
      rows = await db.query(sql, vars);

      if (rows.length) throw 'That email address is already in use';

      address = req.body.address;
    }

    sql = `
      SELECT primaryEmailId, address FROM primary_emails
      WHERE primaryEmailId = ? AND userId = ?
    `;
    vars = [req.body.to, req.session.uid];
    rows = await db.query(sql, vars);

    // 'To' email does not exist and user is not using a 'to' address
    if (!rows.length && !req.body.noToAddress)
      throw 'Could not find main email';

    const data = {
      primaryEmailId: req.body.noToAddress ? 0 : rows[0].primaryEmailId,
      directForward: req.body.directForward,
      description: req.body.description,
      spamFilter: !req.body.noSpamFilter,
      saveMail: req.body.saveMail || req.body.noToAddress,
      domainId: req.body.domain,
      userId: req.session.uid,
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
      data.directForward,
      db
    );
    await validateProxyEmailModifiers(
      modifiers,
      req.session.uid,
      data.directForward,
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
      saveMail: data.saveMail,
      address: data.address + '@' + domain,
      filters
    });

    // Build Mailgun route action(s)
    const action = buildMailgunRouteAction(
      req.body.directForward
        ? { id, address: rows[0].address }
        : { id, save: data.saveMail }
    );

    const mailgun = Mailgun({ apiKey: CONFIG.MAILGUN_KEY, domain });

    // Create Mailgun route
    // @ts-ignore
    const mgRes = await mailgun.routes().create({
      description: 'Ptorx ' + CONFIG.PROD ? 'prod' : 'dev',
      expression,
      priority: data.spamFilter && !data.saveMail ? 3000 : 1000,
      action
    });

    // Save Mailgun route ID to proxy email
    sql = `
      UPDATE proxy_emails SET mgRouteId = ?
      WHERE proxyEmailId = ?
    `;
    vars = [mgRes.route.id, id];
    dbRes = await db.query(sql, vars);

    if (filters.length) {
      sql = // Link filters to email
        'INSERT INTO links (filterId, proxyEmailId) VALUES ' +
        filters.map(f => `('${f}', '${id}')`).join(', ');
      dbRes = await db.query(sql);
    }

    if (modifiers.length) {
      sql = // Link modifiers to email
        'INSERT INTO links ' +
        '(modifierId, proxyEmailId, orderIndex) VALUES ' +
        modifiers.map((m, i) => `('${m}', '${id}', '${i}')`).join(', ');
      dbRes = await db.query(sql);
    }

    // Increment emailsCreated
    sql = `
      UPDATE users SET emailsCreated = emailsCreated + 1
      WHERE userId = ?
    `;
    vars = [req.session.uid];
    dbRes = await db.query(sql, vars);

    res.status(200).json({ id });
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
}
