const getKeywords = require("lib/keywords/get");
const getInfo = require("lib/email/get-info");
const request = require("request");

let config = require("config");
let mailgun = require("mailgun-js")({
    apiKey: config.keys.mailgun, domain: "ptorx.com"
});

/*
    POST api/receive/free/:email
    REQUIRED
        subject: string, To: string, body-plain: string
    OPTIONAL
        body-html: string
    RETURN HTTP CODE
        200: Success, 406: Error
    DESCRIPTION
        Receive emails for addresses linked to non-premium members
        Pull keywords out of email content to generate advert
        Insert advert into email
        Redirect email off to user's 'to' address
    NOTES
        Free users only receive 'accept on match' subject filtering (via MG)
*/
module.exports = function(req, res) {
    
    getInfo(req.params.email, false, (err, data) => {
        if (err) {
            res.status(406).send();
        }
        else {
            // Pull keywords out of content
            let keywords = (getKeywords(req.body["body-plain"], 25)
                .concat(req.body.subject.toLowerCase().split(' '))
            ).join(',');
            let xads = require("../../config").addresses.xads;

            let url = encodeURI(`${xads}&count=1&types=1,2&ip=${req.ip}&keywords=${keywords}`);

            // Generate an advertisement via XAds
            request(url, (err, response, body) => {
                let ad = JSON.parse(body).ads[0];

                // If XAds returned an ad, append it to message content
                if (ad !== undefined) {
                    if (req.body["body-html"]) {
                        req.body["body-html"] += ""
                            + "<div style='position:fixed;bottom:0%;width:100%;background-color:white;z-index:99999;"
                            + "padding:0.5em;text-align:center;color:black;'>"
                                + `<strong>Advertisement:</strong> <a href='${ad.link}'>${ad.title}</a> -- `
                                + `<span> ${ad.description } </span>`
                            + "</div>";
                    }
                    
                    req.body["body-plain"] += "\r\n\r\n\r\n"
                        + `Advertisement: ${ad.title} -- ${ad.description}`;
                }

                // Forward message to user's main email
                data = {
                    text: req.body["body-plain"], html: req.body["body-html"] ? req.body["body-html"] : "",
                    from: req.body.To, to: data.to, subject: req.body.subject
                };

                mailgun.messages().send(data, (err, body) => {
                    res.status(err ? 406 : 200).send();
                });
            });
        }
    });

};