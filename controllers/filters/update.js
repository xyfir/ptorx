const clearCache = require('lib/email/clear-cache');
const validate = require('lib/filter/validate');
const db = require('lib/db');

/*
    PUT api/filters/:filter
    REQUIRED
        type: number, name: string, description: string, find: string
    OPTIONAL
        acceptOnMatch: boolean, useRegex: boolean
    RETURN
        { error: boolean, message?: string, update?: number[] }
    DESCRIPTION
        Update a filter's data
*/
module.exports = function(req, res) {
  let response = validate(req.body);

  if (response != 'ok') {
    res.json({ error: true, message: response });
    return;
  }

  let sql = `
        SELECT type, accept_on_match as acceptOnMatch FROM filters
        WHERE filter_id = ? AND user_id = ?
    `;

  db(cn =>
    cn.query(sql, [req.params.filter, req.session.uid], (err, rows) => {
      if (err || !rows.length) {
        cn.release();
        res.json({ error: true, message: 'An unknown error occured' });
        return;
      }

      const data = rows[0];

      sql = `
            UPDATE filters SET name = ?, description = ?, type = ?, find = ?,
            accept_on_match = ?, use_regex = ?
            WHERE filter_id = ?
        `;
      let vars = [
        req.body.name,
        req.body.description,
        req.body.type,
        req.body.find,
        !!+req.body.acceptOnMatch,
        !!+req.body.useRegex,
        req.params.filter
      ];

      cn.query(sql, vars, (err, result) => {
        if (err || !result.affectedRows) {
          cn.release();
          res.json({ error: true, message: 'An unknown error occured-' });
          return;
        }

        sql = `SELECT email_id as id FROM linked_filters WHERE filter_id = ?`;
        cn.query(sql, [req.params.filter], (err, rows) => {
          cn.release();

          if (!rows.length) {
            res.json({ error: false });
          } else {
            let update = rows.map(email => email.id);

            // Clear from Redis cache
            update.forEach(email => clearCache(email));

            if (
              // Determine if MailGun routes need to be updated
              ([1, 2, 3, 6].indexOf(data.type) > -1 && !!+data.acceptOnMatch) ||
              ([1, 2, 3, 6].indexOf(+req.body.type) > -1 &&
                req.body.acceptOnMatch)
            )
              res.json({ error: false, update });
            else res.json({ error: false });
          }
        });
      });
    })
  );
};
