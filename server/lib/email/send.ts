import * as mailcomposer from 'mailcomposer';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';

/**
 * @typedef {object} SendEmailOptions
 * @prop {string} to
 * @prop {string} from
 * @prop {string} subject
 * @prop {string} html
 * @prop {string} domain
 */
/**
 * Sends an email.
 * @async
 * @param {SendEmailOptions} options
 * @return {object} Mailgun response
 */
export const sendEmail = options =>
  new Promise((resolve, reject) => {
    const mailgun = Mailgun({
      apiKey: CONFIG.MAILGUN_KEY,
      domain: options.domain
    });

    mailcomposer(options).build((err, message) =>
      mailgun
        .messages()
        // @ts-ignore
        .sendMime(
          { to: options.to, message: message.toString('ascii') },
          (err, body) => (err ? reject(err) : resolve(body))
        )
    );
  });
