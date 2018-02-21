const escapeRegExp = require('escape-string-regexp');
const saveMessage = require('lib/email/save-message');
const getInfo = require('lib/email/get-info');
const request = require('superagent');
const MailGun = require('mailgun-js');
const config = require('config');

/*
  POST api/receive/:email
  REQUIRED
    from: string, // 'user@domain' OR 'Sender Name <user@domain>'
    sender: string, // Always 'user@domain'
    subject: string,
    recipient: string, // 'user@ptorx-domain'
    body-plain: string,
    message-headers: json-string // [['header', 'value']]
  OPTIONAL
    body-html: string, message-url: string, attachments: json-string
  RETURNS
    HTTP STATUS - 200: Success, 406: Error
  DESCRIPTION
    Receive emails from MailGun
    Messages are ran through any filters that weren't or can't be run on MailGun
    Messages are then modified via modifiers
*/
module.exports = async function(req, res) {

  try {
    const email = req.body;
    const save = !!email['message-url'];

    email.senderDomain = email.sender.split('@')[1],
    email.proxyDomain = email.recipient.split('@')[1],
    email.senderName = email.from.match(/^(.+) <(.+)>$/);

    if (email.senderName) {
      email.originalSender = email.senderName[2],
      email.senderName = email.senderName[1];
    }
    else {
      email.originalSender = email.sender,
      email.senderName = '';
    }

    const headers = {};
    JSON.parse(email['message-headers']).forEach(h => headers[h[0]] = h[1]);

    const isEmailSpam = headers['X-Mailgun-Sflag'] == 'Yes';

    // Get primary email / filters / modifiers
    const data = await getInfo(req.params.email, save);

    // Save mail as spam and quit
    if (data.spamFilter && isEmailSpam) {
      await saveMessage(req, 2);
      return res.status(200).send();
    }

    // Loop through filters
    data.filters.forEach((filter, i) => {
      // MailGun already validated filter
      if (filter.pass) return;

      // Escape regex if filter is not using regex
      if (!filter.regex && filter.type != 6)
        filter.find = escapeRegExp(filter.find);

      switch (filter.type) {
        case 1: // Subject
          data.filters[i].pass = email.subject
            .match(new RegExp(filter.find, 'g'));
          break;
        case 2: // Sender Address
           data.filters[i].pass = email.sender
            .match(new RegExp(filter.find, 'g'));
          break;
        case 3: // From Domain
           data.filters[i].pass = email.senderDomain
            .match(new RegExp(`(.*)@${filter.find}'`, 'g'));
          break;
        case 4: // Text
           data.filters[i].pass = email['body-plain']
            .match(new RegExp(filter.find, 'g'));
          break;
        case 5: // HTML
           data.filters[i].pass = (email['body-html'] || '')
            .match(new RegExp(filter.find, 'g'));
          break;
        case 6: // Header
          const [header, search] = filter.find.split(':::');
          const regex = new RegExp(
            !filter.regex ? escapeRegExp(search) : search, 'g'
          );

          if (headers[header] && regex.test(headers[header]))
            data.filters[i].pass = true;
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
        if (save) saveMessage(req, 1);

        res.status(200).send();
        return;
      }
    }

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
            new RegExp(
              modifier.data.value, modifier.data.flags
            ),
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
          else
            email.subject += modifier.data.value;
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
              modifier.data.separator +
              email[modifier.data.add];
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

    // Message should be redirected
    if (data.to) {
      const message = {
        subject: email.subject,
        text: email['body-plain'],
        from: email.recipient,
        html: email['body-html'] && !textonly ? email['body-html'] : '',
        to: data.to
      };

      const mailgun = MailGun({
        apiKey: config.keys.mailgun, domain: email.proxyDomain
      });

      // Download attachments and attach them to the new message
      if (email.attachments) {
        const attachments = JSON.parse(email.attachments);

        if (attachments.length) message.attachment = [];

        for (let att of attachments) {
          // Download file as buffer
          const dl = await request
            .get(`https://api:${config.keys.mailgun}@${att.url.substr(8)}`)
            .buffer(true)
            .parse(request.parse['application/octet-stream']);

          // Create attachment via MailGun.Attachment
          message.attachment.push(
            new mailgun.Attachment({
              data: dl.body, filename: att.name,
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
              data: file.buffer, filename: file.originalname,
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
    // Message must be saved since it's not being redirected
    else {
      saveMessage(req, 0);
    }

    res.status(200).send();
  }
  catch (err) {
    res.status(406).send();
  }

};