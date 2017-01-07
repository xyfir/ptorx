const rword = require("rword");

if (global.___words === undefined) {
    global.___words = [];
}

module.exports = function(cn, fn) {

    const generate = (email) => {
        email += Date.now().toString().substr(-2);

        let sql = `
            SELECT email_id FROM redirect_emails WHERE address = ?
        `;

        cn.query(sql, [email + "@ptorx.com"], (err, rows) => {
            if (!!rows.length)
                generate(email);
            else
                fn(email + "@ptorx.com");
        });
    };

    // Load 1000 words from rword
    if (global.___words.length === 0) {
        request.get(url, (err, response, body) => {
            global.___words = rword(1000);
            generate(global.___words.pop());
        });
    }
    else {
        generate(global.___words.pop());
    }

};