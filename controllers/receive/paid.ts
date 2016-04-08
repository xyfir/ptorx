import escapeRegExp = require("escape-string-regexp");
import encrypt = require("../../lib/encrypt");
import getInfo = require("../../lib/email/get-info");
import db = require("../../lib/db");

let config = require("../../config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "mail.ptorx.com"
});

/*
    POST api/receive/paid/:email
    REQUIRED
        recipient: string, from: string, subject: string, To: string
        body-plain: string, message-headers: json-string
    OPTIONAL
        body-html: string, message-url: string
    RETURN HTTP CODE
        200: Success, 406: Error
    DESCRIPTION
        Receive emails for addresses linked to premium users
        Messages are ran through any filters that can't be run on MailGun
        Messages are then modified via modifiers
*/
export = function (req, res) {
    
    // Get email/filters/modifiers data
    getInfo(req.params.email, true, (err, data) => {
        if (err) {
            res.status(406);
            return;
        }

        const headers = JSON.parse(req.body["message-headers"]);

        // Loop through filters
        data.filters.forEach((filter, i) => {
            // All filters here other than text/html content are reject on match
            switch (filter.type) {
                case 1: // Subject
                    return data.filters[i].pass = !req.body.subject.match(new RegExp(filter.find, 'g'));
                case 2: // From Address
                    return data.filters[i].pass = !req.body.from.match(new RegExp(filter.find, 'g'));
                case 3: // From Domain
                    return data.filters[i].pass = !req.body.from.match(new RegExp(`(.*)@${filter.find}'`, 'g'));
                case 4: // Text
                    if (!!(+filter.acceptOnMatch))
                        return data.filters[i].pass = !!req.body["body-plain"].match(new RegExp(filter.find, 'g'));
                    else
                        return data.filters[i].pass = !req.body["body-plain"].match(new RegExp(filter.find, 'g'));
                case 5: // HTML
                    if (!!(+filter.acceptOnMatch))
                        return data.filters[i].pass = !!(req.body["body-html"] || '').match(new RegExp(filter.find, 'g'));
                    else if (req.body["body-html"])
                        return data.filters[i].pass = !req.body["body-html"].match(new RegExp(filter.find, 'g'));
                case 6: // Header
                    let find: string[] = filter.find.split(":::");
                    headers.forEach(header => {
                        if (header[0] == find[0] && ('' + header[1]).match(new RegExp(find[1], 'g')))
                            data.filters[i].pass = false;
                    });
            }
        });

        // Check if all filters passed
        for (let filter in data.filters) {
            if (!filter.pass) {
                res.status(200);
                return;
            }
        }

        let textonly: boolean = false;

        // Loop through modifiers
        data.modifiers.forEach(modifier => {
            switch (modifier.type) {
                case 1: // Encrypt
                    req.body["body-plain"] = encrypt(req.body["body-plain"], modifier.data);
                    if (req.body["body-html"] && !textonly)
                        req.body["body-html"] = encrypt(req.body["body-html"], modifier.data);
                    break;
                case 2: // Text Only
                    textonly = true; break;
                case 3: // Find & Replace
                    req.body["body-plain"] = req.body["body-plain"].replace(
                        new RegExp(modifier.data.value, 'g'), modifier.data.with
                    );
                    if (req.body["body-html"] && !textonly) {
                        req.body["body-html"] = req.body["body-html"].replace(
                            new RegExp(modifier.data.value, 'g'), modifier.data.with
                        );
                    }
                    break;
                case 4: // Subject Overwrite
                    req.body.subject = modifier.data; break;
                case 5: // Subject Tag
                    if (modifier.data.prepend)
                        req.body.subject = modifier.data.value + req.body.subject;
                    else
                        req.body.subject += modifier.data.value;
            }
        });

        data = {
            text: req.body["body-plain"], html: (
                req.body["body-html"] && !textonly ? req.body["body-html"] : ""
            ), from: req.body.to, to: data.address, subject: req.body.subject
        };

        // Forward message to user's main email
        mailgun.messages().send(data, (err, body) => {
            if (err) {
                res.status(406);
            }
            else {
                res.status(200);

                // Optionally save message to messages table
                if (req.body['message-url']) {
                    let sql: string = `
                        INSERT INTO messages (email_id, message_key, received, subject) VALUES (?, ?, ?, ?)
                    `;
                    let vars = [
                        req.params.email, req.body['message-url'].split('/').slice(-1)[0],
                        req.body.timestamp, req.body.subject
                        
                    ];

                    db(cn => cn.query(sql, vars, (err, result) => cn.release()));
                }
            }
        });
    });

};