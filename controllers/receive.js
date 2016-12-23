const escapeRegExp = require("escape-string-regexp");
const saveMessage = require("lib/email/save-message");
const getInfo = require("lib/email/get-info");
const crypto = require("lib/crypto");
const db = require("lib/db");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    POST api/receive/:email
    REQUIRED
        from: string, subject: string, To: string
        body-plain: string, message-headers: json-string
    OPTIONAL
        body-html: string, message-url: string
    RETURN HTTP CODE
        200: Success, 406: Error
    DESCRIPTION
        Receive emails from MailGun
        Messages are ran through any filters that weren't or can't be run on MailGun
        Messages are then modified via modifiers
*/
module.exports = function(req, res) {

    const save = !!req.body["message-url"];
    
    // Get email/filters/modifiers data
    getInfo(req.params.email, false, save, (err, data) => {
        if (err) {
            res.status(406).send();
            return;
        }
        
        const headers = JSON.parse(req.body["message-headers"]);

        // Loop through filters
        data.filters.forEach((filter, i) => {
            // MailGun already validated filter
            if (filter.pass) return;

            // Escape regex if filter is not using regex
            if (!filter.regex && filter.type != 6)
                filter.find = escapeRegExp(filter.find);

            switch (filter.type) {
                case 1: // Subject
                    data.filters[i].pass = req.body.subject
                        .match(new RegExp(filter.find, 'g'));
                    break;
                case 2: // From Address
                     data.filters[i].pass = req.body.from
                        .match(new RegExp(filter.find, 'g'));
                    break;
                case 3: // From Domain
                     data.filters[i].pass = req.body.from
                        .match(new RegExp(`(.*)@${filter.find}'`, 'g'));
                    break;
                case 4: // Text
                     data.filters[i].pass = req.body["body-plain"]
                        .match(new RegExp(filter.find, 'g'));
                    break;
                case 5: // HTML
                     data.filters[i].pass = (req.body["body-html"] || '')
                        .match(new RegExp(filter.find, 'g'));
                    break;
                case 6: // Header
                    const find = filter.find.split(":::");

                    headers.forEach(header => {
                        if (
                            header[0] == find[0]
                            && ('' + header[1]).match(new RegExp(
                                !filter.regex ? escapeRegExp(find[1]) : find[1],
                                'g'
                            ))
                        ) data.filters[i].pass = true;
                    });
            }

            // Flip value if reject on match
            data.filters[i].pass = !!(+filter.acceptOnMatch)
                ? !!data.filters[i].pass
                : !data.filters[i].pass;
        });

        // Check if all filters passed
        for (let filter of data.filters) {
            if (!filter.pass) {
                // Optionally save as rejected message
                if (save) saveMessage(req, true);

                res.status(200).send();
                return;
            }
        }

        let textonly = false;

        // Loop through modifiers
        data.modifiers.forEach(modifier => {
            switch (modifier.type) {
                case 1: // Encrypt
                    req.body["body-plain"] = crypto.encrypt(
                        req.body["body-plain"], modifier.data
                    );
                    
                    if (req.body["body-html"] && !textonly) {
                        req.body["body-html"] = crypto.encrypt(
                            req.body["body-html"], modifier.data
                        );
                    }
                    break;
                case 2: // Text Only
                    textonly = true; break;
                case 3: // Find & Replace
                    // Escape search if not regular expression
                    modifier.data.value = !modifier.data.regex
                        ? escapeRegExp(modifier.data.value)
                        : modifier.data.value;
                    
                    // Escape '$' if not regular expression
                    modifier.data.with = !modifier.data.regex
                        ? modifier.data.value.replace(/\$/g, "$$")
                        : modifier.data.value;

                    req.body["body-plain"] = req.body["body-plain"].replace(
                        new RegExp(
                            modifier.data.value, modifier.data.flags
                        ),
                        modifier.data.with
                    );
                    
                    if (req.body["body-html"] && !textonly) {
                        req.body["body-html"] = req.body["body-html"].replace(
                            new RegExp(
                                modifier.data.value, modifier.data.flags
                            ),
                            modifier.data.with
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

        const message = {
            text: req.body["body-plain"], from: req.body.To, to: data.to,
            subject: req.body.subject, html: (
                req.body["body-html"] && (!textonly ? req.body["body-html"] : "")
            )
        };

        // Forward message to user's main email
        mailgun.messages().send(message, (err, body) => {
            if (err) {
                res.status(406).send();
            }
            else {
                res.status(200).send();

                // Optionally save message to messages table
                if (save) saveMessage(req, false);
            }
        });
    });

};