const request = require('superagent');
const crypto = require('lib/crypto');
const moment = require('moment');
const mysql = require('lib/mysql');

const config = require('config');

/*
  POST api/account/purchase/swiftdemand
  REQUIRED
    BODY
      swiftId: string
    OR
      BODY
        id: number, uuid: string, product_id: number, sender_swift_name: string,
        swifts: number, status: string, callback_url: string, redirect_url: string,
        created_at: string, updated_at: string
      QUERY
        data: encrypted-json-string {
          user_id: number
        }
  RETURN
    { error: boolean, message?: string, redirect?: string }
    OR
    HTTP STATUS 200
  DESCRIPTION
    Initiate the process of making a SwiftDemand payment
    OR
    Handle a completed SwiftDemand payment
*/
module.exports = async function(req, res) {

  const db = new mysql, {body, query} = req;

  try {
    if (body.swiftId) {
      const sdRes = await request
        .post('https://testing.swiftdemand.com/api/v0/payments')
        .send({
          product_id: 2,
          redirect_url: config.addresses.ptorx.root + 'app/#/account',
          callback_url:
            config.addresses.ptorx.callback +
            'api/account/purchase/swiftdemand?data=' + 
            crypto.encrypt(
              JSON.stringify({ user_id: req.session.uid }),
              config.keys.swiftDemand
            ),
          sender_swift_name: body.swiftId
        });

      res.json({ error: false, redirect: sdRes.body.link });
    }
    else {
      const info = JSON.parse(
        crypto.decrypt(query.data, config.keys.swiftDemand)
      );

      // Only users in trial mode can use SwiftDemand
      await db.getConnection();
      await db.query(`
        UPDATE users
        SET subscription = ?, referral = ?, trial = ?
        WHERE user_id = ? AND trial = ?
      `, [
        +moment().add(90, 'days').format('x'), '{}', 0,
        info.user_id, 1
      ]);
      db.release();

      res.status(200).send();
    }
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};