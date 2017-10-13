const request = require('superagent');
const config = require('config');
const mysql = require('lib/mysql');
const uuid = require('uuid/v4');

/*
  POST api/domains
  REQUIRED
    domain: string
  RETURN
    {
      error: boolean, message?: string,
      
      // Domain already exists and user must request access
      requestKey?: string,
      
      // Domain is new and user must verify ownership
      domainId?:string,
      domainKey?: {
        name: string, value: string
      }
    }
  DESCRIPTION
    Depending on whether the domain already exists in Ptorx's database or not,
    either begins process of adding domain to Ptorx and MailGun, or generates
    request key for user to request access to domain with.
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [row] = await db.query(`
      SELECT
        (SELECT id FROM domains WHERE domain = ?) AS domainId,
        (SELECT trial FROM users WHERE user_id = ?) AS trial
    `, [
      req.body.domain,
      req.session.uid
    ]);

    if (row.trial) throw 'Trial users cannot add domains';

    // Domain already exists; user must request access
    if (row.domain) {
      // Generate request key
      const key = uuid();

      // Add user to domain_users (update key if already linked to domain)
      const result = await db.query(`
        INSERT INTO domain_users SET ?
        ON DUPLICATE KEY UPDATE request_key = '${key}'
      `, {
        domain_id: row.domainId, user_id: req.session.uid, request_key: key
      });

      db.release();
      res.json({ error: false, requestKey: key });
    }
    // Domain does not exist; user must verify ownership
    else {
      // Add domain to MailGun
      const {body: mgRes} = await request
        .post(config.addresses.mailgun + 'domains')
        .type('form')
        .send({
          name: req.body.domain, spam_action: 'tag', smtp_password: uuid(),
          wildcard: false
        });

      // Get domainkey
      const key = mgRes.sending_dns_records
        .find(r => /\._domainkey\./.test(r.name));

      // Add database, user, key to domains
      const dbRes = await db.query(`
        INSERT INTO domains SET ?
      `, {
        domain: req.body.domain, user_id: req.session.uid,
        domain_key: JSON.stringify({ name: key.name, value: key.value })
      });

      const domainId = dbRes.insertId;

      // Add user to domain_users
      await db.query(`
        INSERT INTO domain_users SET ?
      `, {
        domain_id: domainId, user_id: req.session.uid, authorized: true
      });

      db.release();
      res.json({ error: false, domainId, domainKey: key });
    }
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};