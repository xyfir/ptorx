import { validateProxyEmailModifiers } from 'lib/proxy-emails/validate-modifiers';
import { buildMailgunRouteExpression } from 'lib/mg-routes/build-expression';
import { validateProxyEmailFilters } from 'lib/proxy-emails/validate-filters';
import { buildMailgunRouteAction } from 'lib/mg-routes/build-action';
import { validateProxyEmail } from 'lib/proxy-emails/validate';
import { Request, Response } from 'express';
import { requireCredits } from 'lib/users/require-credits';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';

export async function api_editProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    validateProxyEmail(req.body);

    await requireCredits(db, +req.session.uid);

    let sql = `
      SELECT
        pxe.mgRouteId AS mgRouteId, pme.address AS toEmail, d.domain,
        CONCAT(pxe.address, '@', d.domain) AS address
      FROM
        proxy_emails AS pxe, domains AS d, primary_emails AS pme
      WHERE
        pxe.proxyEmailId = ? AND
        d.id = pxe.domainId AND
        pme.primaryEmailId = ? AND pme.userId = ?
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

    await validateProxyEmailModifiers(
      modifiers,
      req.session.uid,
      req.body.directForward,
      db
    );
    await validateProxyEmailFilters(
      filters,
      req.session.uid,
      req.body.directForward,
      db
    );

    const saveMail = req.body.saveMail || !req.body.to;

    // Update values in proxy_emails
    sql = `
      UPDATE proxy_emails SET
        primaryEmailId = ?, name = ?,
        description = ?, saveMail = ?,
        directForward = ?, spamFilter = ?
      WHERE proxyEmailId = ?
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
    const expression = await buildMailgunRouteExpression(db, {
      address,
      filters,
      saveMail
    });

    // Build Mailgun route action(s)
    const action = buildMailgunRouteAction(
      req.body.directForward
        ? { id: req.params.email, address: toEmail }
        : { id: req.params.email, save: saveMail }
    );

    const mailgun = Mailgun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain
    });

    // Update Mailgun route
    // @ts-ignore
    await mailgun.routes(mgRouteId).update({
      description: 'Ptorx ' + CONFIG.PROD ? 'prod' : 'dev',
      expression,
      priority: !req.body.noSpamFilter && !saveMail ? 3000 : 1000,
      action
    });

    // Delete all filters
    sql = `
      DELETE FROM links WHERE proxyEmailId = ?
    `;
    vars = [req.params.email];
    dbRes = await db.query(sql, vars);

    // Delete all modifiers since the order may have changed
    sql = `
      DELETE FROM links WHERE proxyEmailId = ?
    `;
    vars = [req.params.email];
    dbRes = await db.query(sql, vars);

    // Insert modifiers
    if (modifiers.length) {
      sql =
        'INSERT INTO links ' +
        '(modifierId, proxyEmailId, orderIndex) VALUES ' +
        modifiers
          .map((m, i) => `('${m}', '${+req.params.email}', '${i}')`)
          .join(', ');
      dbRes = await db.query(sql);
    }

    // Insert filters
    if (filters.length) {
      sql =
        'INSERT INTO links (filterId, proxyEmailId) VALUES ' +
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
