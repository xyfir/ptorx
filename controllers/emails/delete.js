const MailGun = require('mailgun-js');
const config = require('config');
const mysql = require('lib/mysql');

/*
  DELETE api/emails/:email
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Marks a proxy email as deleted, delete its MailGun route, and deletes its
    links to any filters or modifiers
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [email] = await db.query(`
      SELECT
        re.mg_route_id AS mgRouteId, d.domain
      FROM
        redirect_emails AS re, domains AS d
      WHERE
        re.email_id = ? AND re.user_id = ? AND d.id = re.domain_id
    `, [
      req.params.email, req.session.uid
    ]);

    if (!email) throw 'Could not find email in your account';

    // Remove any information that could be linked to the creator
    // Keep in database so that a 'deleted' proxy email cannot be created again
    await db.query(`
      UPDATE redirect_emails SET
        user_id = 0, to_email = 0, name = '', description = '',
        mg_route_id = ''
      WHERE email_id = ?
    `, [
      req.params.email
    ]);

    const mailgun = MailGun({
      apiKey: config.keys.mailgun, domain: email.domain
    });

    await mailgun.routes(email.mgRouteId).delete();

    // Because proxy email is not actually getting deleted and thus won't
    // trigger a foreign key ON DELETE CASCADE we must manually remove the
    // linked filters and modifiers
    await db.query(
      'DELETE FROM linked_filters WHERE email_id = ?',
      [req.params.email]
    );
    await db.query(
      'DELETE FROM linked_modifiers WHERE email_id = ?',
      [req.params.email]
    );
    db.release();

    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};