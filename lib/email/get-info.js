const mysql = require('lib/mysql');

/**
 * Returns data that the 'receive mail' controller needs: 'to' address, 
 * filters, and modifiers.
 * @async
 * @param {number} email - The id of the email to load.
 * @param {boolean} save - True if mail sent to the email is saved.
 * @returns {object}
 */
module.exports = async function(email, save) {

  const db = new mysql;

  try {
    const value = { to: '', filters: [], modifiers: [] };

    await db.getConnection();
    
    // Grab to_email address
    let sql = `
      SELECT
        me.address AS address
      FROM
        main_emails AS me, redirect_emails AS re
      WHERE
        re.email_id = ?
        AND me.email_id = re.to_email
    `,
    vars = [
      email
    ],
    rows = await db.query(sql, vars);

    if (!rows.length) throw 'Email does not exist';

    // Will be empty string if to_email = 0
    value.to = rows[0].address;

    // Grab all filters
    // pass is set to 1 if MailGun already validated
    sql = `
      SELECT
        type, find, accept_on_match AS acceptOnMatch,
        use_regex AS regex, IF(
          ${save ? 0 : 1} = 1
          AND accept_on_match = 1
          AND type IN (1, 2, 3, 6),
          1, 0
        ) AS pass
      FROM filters WHERE filter_id IN (
        SELECT filter_id FROM linked_filters WHERE email_id = ?
      )
    `,
    value.filters = rows = await db.query(sql, vars);

    // Load modifiers
    sql = `
      SELECT
        modifiers.type, modifiers.data
      FROM
        modifiers, linked_modifiers
      WHERE
        modifiers.modifier_id = linked_modifiers.modifier_id
        AND linked_modifiers.email_id = ?
      ORDER BY
        linked_modifiers.order_number
    `,
    rows = await db.query(sql, vars);

    db.release();

    // Parse modifier.data if it's a JSON string
    value.modifiers = rows.map(mod =>
      Object({
        type: mod.type,
        data: mod.data[0] == '{' && mod.data[mod.data.length - 1] == '}'
          ? JSON.parse(mod.data) : mod.data
      })
    );

    return value;
  }
  catch (err) {
    db.release();
    throw err;
  }

};