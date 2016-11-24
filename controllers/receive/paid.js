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
    POST api/receive/paid/:email
    REQUIRED
        from: string, subject: string, To: string
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
module.exports = function(req, res) {
    
    // Get email/filters/modifiers data
    getInfo(req.params.email, false, (err, data) => {
        if (err) {
            res.status(406).send();
            return;
        }
        
        const headers = JSON.parse(req.body["message-headers"]);

        // Loop through filters
        data.filters.forEach((filter, i) => {
            // All filters here other than text/html content are reject on match
            switch (filter.type) {
                case 1: // Subject
                    return data.filters[i].pass = !req.body.subject
                        .match(new RegExp(filter.find, 'g'));
                case 2: // From Address
                    return data.filters[i].pass = !req.body.from
                        .match(new RegExp(filter.find, 'g'));
                case 3: // From Domain
                    return data.filters[i].pass = !req.body.from
                        .match(new RegExp(`(.*)@${filter.find}'`, 'g'));
                case 4: // Text
                    if (!!(+filter.acceptOnMatch)) {
                        return data.filters[i].pass = !!req.body["body-plain"]
                            .match(new RegExp(filter.find, 'g'));
                    }
                    else {
                        return data.filters[i].pass = !req.body["body-plain"]
                            .match(new RegExp(filter.find, 'g'));
                    }
                case 5: // HTML
                    if (!!(+filter.acceptOnMatch)) {
                        return data.filters[i].pass = !!(req.body["body-html"] || '')
                            .match(new RegExp(filter.find, 'g'));
                    }
                    else if (req.body["body-html"]) {
                        return data.filters[i].pass = !req.body["body-html"]
                            .match(new RegExp(filter.find, 'g'));
                    }
                case 6: // Header
                    let find = filter.find.split(":::");
                    headers.forEach(header => {
                        if (
                            header[0] == find[0]
                            && ('' + header[1]).match(new RegExp(find[1], 'g'))
                        ) data.filters[i].pass = false;
                    });
            }
        });

        // Check if all filters passed
        for (let filter of data.filters) {
            if (!filter.pass) {
                // Optionally save as rejected message
                if (req.body["message-url"]) saveMessage(req, true);

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
                    req.body["body-plain"] = req.body["body-plain"].replace(
                        new RegExp(modifier.data.value, 'g'),
                        modifier.data.with
                    );
                    if (req.body["body-html"] && !textonly) {
                        req.body["body-html"] = req.body["body-html"].replace(
                            new RegExp(modifier.data.value, 'g'),
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
                if (req.body["message-url"]) saveMessage(req, false);
            }
        });
    });

};