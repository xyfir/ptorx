const rword = require('rword');

if (global.___words === undefined) {
  global.___words = [];
}

module.exports = function(cn, fn) {

  const generate = (email) => {
    email += Date.now().toString().substr(-2);

    const sql = `
      SELECT email_id FROM redirect_emails WHERE address = ?
    `;

    cn.query(sql, [email + '@ptorx.com'], (err, rows) => {
      if (!!rows.length)
        generate(email);
      else
        fn(email + '@ptorx.com');
    });
  };

  generate(rword.generateFromPool(1));

};