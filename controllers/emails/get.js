const mysql = require('lib/mysql');

/*
  GET api/emails/:email
  RETURN
    { 
      error: boolean, toEmail: string, saveMail: boolean, name: string,
      address: string, directForward: boolean, description: string,
      spamFilter: boolean, id: number
      filters: [{
        id: number, name: string, description: string, type: number
      }],
      modifiers: [{
        id: number, name: string, description: string, type: number
      }]
    }
  DESCRIPTION
    Returns full data for a single proxy email
*/
module.exports = async function(req, res) {
  const db = new mysql();

  try {
    await db.getConnection();

    let sql = `
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
      vars = [req.params.email, req.session.uid],
      rows = await db.query(sql, vars);

    if (!rows.length || rows[0].toEmail == null) throw 'Could not find email';

    const response = rows[0];

    (response.error = false),
      (response.saveMail = !!response.saveMail),
      (response.spamFilter = !!response.spamFilter),
      (response.directForward = !!response.directForward);

    // Grab basic info for all filters linked to email
    (sql = `
      SELECT filter_id AS id, name, description, type
      FROM filters WHERE filter_id IN (
        SELECT filter_id FROM linked_filters WHERE email_id = ?
      )
    `),
      (vars = [req.params.email]),
      (rows = await db.query(sql, vars));

    response.filters = rows;

    // Grab basic info for all modifiers linked to email
    (sql = `
      SELECT
        modifiers.modifier_id AS id, modifiers.name,
        modifiers.description, modifiers.type
      FROM
        modifiers, linked_modifiers
      WHERE
        modifiers.modifier_id = linked_modifiers.modifier_id
        AND linked_modifiers.email_id = ?
      ORDER BY linked_modifiers.order_number
    `),
      (rows = await db.query(sql, vars));
    db.release();

    response.modifiers = rows;
    res.json(response);
  } catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }
};
