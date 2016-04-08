import * as request from "request";

if (global["__words"] === undefined) {
    global["__words"] = ["hello", "world", "email"]; // ** empty
}

export = function (cn, fn: Function) {

    const generate = (email: string) => {
        email += String(Date.now()).substr(-2);

        let sql: string = `SELECT email_id FROM redirect_emails WHERE address = ?`;
        cn.query(sql, [email + "@ptorx.com"], (err, rows) => {
            if (!!rows.length)
                generate(email);
            else
                fn(email + "@ptorx.com");
        });
    };

    // Load 500 words from Xyfir's RandWord API
    if (global["__words"].length === 0) {
        let url: string = require("../../config").addresses.randword;

        request.get(url + "?count=500", (err, response, body) => {
            global["__words"] = JSON.parse(body).words;
            generate(global["__words"].pop());
        });
    }
    else {
        generate(global["__words"].pop());
    }

};