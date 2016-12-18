const config = require("config");

const mailcomposer = require("mailcomposer");
const mailgun = require("mailgun-js")({
	apiKey: config.keys.mailgun,
	domain: "xyfir.com"
});

module.exports = function(to, subject, html, fn) {

	mailcomposer({
		from: "Ptorx <ptorx@xyfir.com>",
		to, subject, html
	})
	.build((err, message) => {
		mailgun.messages().sendMime({
			to, message: message.toString("ascii")
        }, (err, body) => {
            if (fn) fn(err, body);
        });
	});

}