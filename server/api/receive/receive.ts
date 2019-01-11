import { Request, Response } from 'express';
import * as escapeRegExp from 'escape-string-regexp';
import { saveMessage } from 'lib/proxy-emails/save-message';
import { chargeUser } from 'lib/users/charge';
import * as Mailgun from 'mailgun-js';
import * as CONFIG from 'constants/config';
import { MySQL } from 'lib/MySQL';
import axios from 'axios';

export async function api_receiveMail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const emailId = +req.params.email;
    const email = req.body;
    const save = !!email['message-url'];

    email.senderDomain = email.sender.split('@')[1];
    email.proxyDomain = email.recipient.split('@')[1];
    email.senderName = email.from.match(/^(.+) <(.+)>$/);

    if (email.senderName) {
      email.originalSender = email.senderName[2];
      email.senderName = email.senderName[1];
    } else {
      email.originalSender = email.sender;
      email.senderName = '';
    }

    const headers = {};
    JSON.parse(email['message-headers']).forEach(h => (headers[h[0]] = h[1]));
    const isEmailSpam = headers['X-Mailgun-Sflag'] == 'Yes';

    // Get needed proxy email data
    const data = {
      to: '', // will be empty string if primary_email_id = 0
      userId: 0,
      filters: [],
      modifiers: [],
      spamFilter: false,
      directForward: false
    };

    // Grab primary_email_id address

    let rows = await db.query(
      `
        SELECT
          pme.address AS \`to\`, pxe.spam_filter AS spamFilter,
          pxe.user_id AS userId, pxe.direct_forward AS directForward
        FROM
          primary_emails AS pme, proxy_emails AS pxe
        WHERE
          pxe.email_id = ?
          AND pme.email_id = pxe.primary_email_id
      `,
      [emailId]
    );
    if (!rows.length) throw 'Email does not exist';
    Object.assign(data, rows[0]);

    // Grab all filters
    // pass is set to 1 if Mailgun already validated
    data.filters = rows = await db.query(
      `
        SELECT
          type, find, accept_on_match AS acceptOnMatch,
          use_regex AS regex, IF(
            ${save ? 0 : 1} = 1
            AND accept_on_match = 1
            AND type IN (1, 2, 3, 6),
            1, 0
          ) AS pass
        FROM filters WHERE filter_id IN (
          SELECT filter_id FROM linked_filters WHERE email_id = ?
        )
      `,
      [emailId]
    );

    // Load modifiers
    rows = await db.query(
      `
        SELECT
          modifiers.type, modifiers.data
        FROM
          modifiers, linked_modifiers
        WHERE
          modifiers.modifier_id = linked_modifiers.modifier_id
          AND linked_modifiers.email_id = ?
        ORDER BY
          linked_modifiers.order_number
      `,
      [emailId]
    );

    // Parse modifier.data if it's a JSON string
    data.modifiers = rows.map(mod => ({
      type: mod.type,
      data:
        mod.data[0] == '{' && mod.data.slice(-1) == '}'
          ? JSON.parse(mod.data)
          : mod.data
    }));

    // Loop through filters
    data.filters.forEach((filter, i) => {
      // Mailgun already validated filter
      if (filter.pass) return;

      // Escape regex if filter is not using regex
      if (!filter.regex && filter.type != 6)
        filter.find = escapeRegExp(filter.find);

      switch (filter.type) {
        case 1: // Subject
          data.filters[i].pass = email.subject.match(
            new RegExp(filter.find, 'g')
          );
          break;
        case 2: // Sender Address
          data.filters[i].pass = email.sender.match(
            new RegExp(filter.find, 'g')
          );
          break;
        case 3: // From Domain
          data.filters[i].pass = email.senderDomain.match(
            new RegExp(`(.*)@${filter.find}'`, 'g')
          );
          break;
        case 4: // Text
          data.filters[i].pass = email['body-plain'].match(
            new RegExp(filter.find, 'g')
          );
          break;
        case 5: // HTML
          data.filters[i].pass = (email['body-html'] || '').match(
            new RegExp(filter.find, 'g')
          );
          break;
        case 6: // Header
          const [header, search] = filter.find.split(':::');
          const regex = new RegExp(
            !filter.regex ? escapeRegExp(search) : search,
            'g'
          );

          if (headers[header] && regex.test(headers[header]))
            data.filters[i].pass = true;
      }

      // Flip value if reject on match
      data.filters[i].pass = !!+filter.acceptOnMatch
        ? !!data.filters[i].pass
        : !data.filters[i].pass;
    });

    let textonly = false;

    // Loop through modifiers
    data.modifiers.forEach(modifier => {
      switch (modifier.type) {
        case 2: // Text Only
          textonly = true;
          break;

        case 3: // Find & Replace
          // Escape search if not regular expression
          modifier.data.value = !modifier.data.regex
            ? escapeRegExp(modifier.data.value)
            : modifier.data.value;

          // Escape '$' if not regular expression
          modifier.data.with = !modifier.data.regex
            ? modifier.data.value.replace(/\$/g, '$$')
            : modifier.data.value;

          email['body-plain'] = email['body-plain'].replace(
            new RegExp(modifier.data.value, modifier.data.flags),
            modifier.data.with
          );

          if (email['body-html'] && !textonly) {
            email['body-html'] = email['body-html'].replace(
              new RegExp(modifier.data.value, modifier.data.flags),
              modifier.data.with
            );
          }
          break;

        case 4: // Subject Overwrite
          email.subject = modifier.data;
          break;

        case 5: // Subject Tag
          if (modifier.data.prepend)
            email.subject = modifier.data.value + email.subject;
          else email.subject += modifier.data.value;
          break;

        case 6: // Concatenate
          // Prepend
          if (modifier.data.prepend) {
            email[modifier.data.to] =
              email[modifier.data.add] +
              modifier.data.separator +
              email[modifier.data.to];
          }
          // Append
          else {
            email[modifier.data.to] +=
              modifier.data.separator + email[modifier.data.add];
          }
          break;

        case 8: // Builder
          email[modifier.data.target] = modifier.data.value
            .replace(
              /{{sender}}/g,
              `${email.senderName} - ${email.originalSender}`
            )
            .replace(/{{subject}}/g, email.subject)
            .replace(/{{body-html}}/g, email['body-html'] || '')
            .replace(/{{body-text}}/g, email['body-plain'])
            .replace(/{{sender-name}}/g, email.senderName)
            .replace(/{{real-address}}/g, data.to)
            .replace(/{{proxy-address}}/g, email.recipient)
            .replace(/{{sender-domain}}/g, email.senderDomain)
            .replace(/{{sender-address}}/g, email.sender)
            .replace(/{{original-sender}}/g, email.originalSender)
            .replace(
              /{{header\('(.+)', '(.+)'\)}}/g,
              (match, p1, p2) => headers[p1] || p2
            );
      }
    });

    // How many credits this action will cost the user
    let credits = 1;

    // Mailgun already forwarded so all we have to do is charge the user
    if (data.directForward) {
      credits++;
    }
    // Save mail as spam and quit
    else if (data.spamFilter && isEmailSpam) {
      await saveMessage(req, 2);
    }
    // Ignore if not all of the filters passed
    else if (data.filters.findIndex(f => !f.pass) > -1) {
      // Optionally save as a rejected message
      if (save) saveMessage(req, 1);
    }
    // Message should be redirected
    else if (data.to) {
      const message = {
        attachment: [],
        subject: email.subject,
        text: email['body-plain'],
        from: email.recipient,
        html: email['body-html'] && !textonly ? email['body-html'] : '',
        to: data.to
      };
      credits++;

      const mailgun = Mailgun({
        apiKey: CONFIG.MAILGUN_KEY,
        domain: email.proxyDomain
      });

      // Download attachments and attach them to the new message
      if (email.attachments) {
        const attachments = JSON.parse(email.attachments);

        for (let att of attachments) {
          // Download file as buffer
          const dl = await axios.get(
            `https://api:${CONFIG.MAILGUN_KEY}@${att.url.substr(8)}`,
            { responseType: 'arraybuffer' }
          );

          // Create attachment via Mailgun.Attachment
          message.attachment.push(
            new mailgun.Attachment({
              data: dl.data,
              filename: att.name,
              contentType: att['content-type']
            })
          );
        }
      }
      // Attachments uploaded directly to Ptorx
      else if (Array.isArray(req.files) && req.files.length) {
        message.attachment = [];

        for (let file of req.files) {
          message.attachment.push(
            new mailgun.Attachment({
              data: file.buffer,
              filename: file.originalname,
              contentType: file.mimetype
            })
          );
        }
      }

      // Optionally save message to messages table
      if (save) {
        const messageId = await saveMessage(req, 0);
        message['h:Reply-To'] = `${messageId}--reply@${email.proxyDomain}`;
      }

      // Forward message to user's primary email
      await mailgun.messages().send(message);
    }
    // Message must be saved as accepted since it's not being redirected
    else {
      saveMessage(req, 0);
    }

    await chargeUser(db, data.userId, credits);
    res.status(200).send();
  } catch (err) {
    res.status(406).send();
  }

  db.release();
}
