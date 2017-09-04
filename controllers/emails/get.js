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

  const db = new mysql;

  try {
    await db.getConnection();

    let sql = `
      SELECT
        re.email_id AS id, re.name, re.description, re.save_mail AS saveMail,
        CONCAT(re.address, '@', d.domain) AS address, me.address AS toEmail,
        re.spam_filter AS spamFilter, re.direct_forward AS directForward
      FROM
        redirect_emails AS re, main_emails AS me, domains AS d
      WHERE
        re.email_id = ? AND re.user_id = ? AND
        me.email_id = re.to_email AND
        d.id = re.domain_id
    `,
    vars = [
      req.params.email, req.session.uid
    ],
    rows = await db.query(sql, vars);

    if (!rows.length || rows[0].toEmail == null)
      throw 'Could not find email';

    const response = rows[0];
    
    response.error = false,
    response.saveMail = !!response.saveMail,
    response.spamFilter = !!response.spamFilter,
    response.directForward = !!response.directForward;

    // Grab basic info for all filters linked to email
    sql = `
      SELECT filter_id AS id, name, description, type
      FROM filters WHERE filter_id IN (
        SELECT filter_id FROM linked_filters WHERE email_id = ?
      )
    `,
    vars = [
      req.params.email
    ],
    rows = await db.query(sql, vars);

    response.filters = rows;

    // Grab basic info for all modifiers linked to email
    sql = `
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
    rows = await db.query(sql, vars);
    db.release();

    response.modifiers = rows;
    res.json(response);
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};