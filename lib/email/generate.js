const request = require("request");

if (global["__words"] === undefined) {
    global["__words"] = [];
}

const url = require("config").addresses.randomWords + "?count=500";

module.exports = function(cn, fn) {

    const generate = (email) => {
        email += Date.now().toString().substr(-2);

        let sql = `SELECT email_id FROM redirect_emails WHERE address = ?`;
        cn.query(sql, [email + "@ptorx.com"], (err, rows) => {
            if (!!rows.length)
                generate(email);
            else
                fn(email + "@ptorx.com");
        });
    };

    // Load 500 words from Xyfir's RandWord API
    if (global["__words"].length === 0) {
        request.get(url, (err, response, body) => {
            global["__words"] = global["__words"].concat(JSON.parse(body).words);
            generate(global["__words"].pop());
        });
    }
    else {
        generate(global["__words"].pop());
    }

};