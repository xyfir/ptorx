const mysql = require('lib/mysql');

/**
 * Validates modifiers a user is trying to link to a proxy email.
 * @param {number[]} modifiers
 * @param {Express.Request} req
 * @param {object} cn
 * @param {function} fn
 */
module.exports = async function(modifiers, req, cn, fn) {

  try {
    // User has no modifiers
    if (String(modifiers[0]) == '') return fn(false);

    const db = new mysql();
    db.cn = cn;

    // Validate that all modifiers exist and user has access to them
    const sql = `
      SELECT type, modifier_id FROM modifiers
      WHERE modifier_id IN (?) AND user_id IN (?)
    `,
    vars = [
      modifiers, [req.session.uid, 0]
    ],
    rows = await db.query(sql, vars);

    if (rows.length != modifiers.length)
      throw 'One or more modifiers provided do not exist';

    // Ensure no more than one encryption modifier is present
    let encrypt = false;
    for (let row in rows) {
      if (row.type == 1 && encrypt)
        throw 'Cannot use more than one encryption modifier';
      else if (row.type == 1)
        encrypt = true;
    }

    fn(false);
  }
  catch (err) {
    fn(true, err);
  }

};