const escapeRegExp = require('escape-string-regexp');
const saveMessage = require('lib/email/save-message');
const getInfo = require('lib/email/get-info');
const request = require('superagent');

const config  = require('config');
const mailgun = require('mailgun-js')({
  apiKey: config.keys.mailgun, domain: 'ptorx.com'
});

/*
  POST api/receive/:email
  REQUIRED
    To: string, // Receiving proxy email address
    from: string, // 'user@domain' OR 'FName LName <user@domain>'
    sender: string, // Always 'user@domain'
    subject: string,
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

  const email = req.body;
  const save = !!email['message-url'];
  
  email.domain = email.sender.match(/.+@(.+)/)[1],
  email.senderName = email.from.match(/^(.+) <(.+)>$/),
  email.senderName = email.senderName ? email.senderName[1] : '';

  try {
    // Get real email / filters / modifiers
    const data = await getInfo(req.params.email, save);

    const headers = JSON.parse(email['message-headers']);

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
           data.filters[i].pass = email.domain
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
          const find = filter.find.split(':::');

          headers.forEach(header => {
            if (
              header[0] == find[0] &&
              String(header[1]).match(
                new RegExp(
                  !filter.regex ? escapeRegExp(find[1]) : find[1],
                  'g'
                )
              )
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
        case 7: // Asana
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
            .replace(/::sender::/g, email.from)
            .replace(/::subject::/g, email.subject)
            .replace(/::body-html::/g, email['body-html'] || '')
            .replace(/::body-text::/g, email['body-plain'])
            .replace(/::sender-name::/g, email.senderName)
            .replace(/::real-address::/g, data.to)
            .replace(/::proxy-address::/g, email.To)
            .replace(/::sender-domain::/g, email.domain)
            .replace(/::sender-address::/g, email.sender);
      }
    });

    // Message should be redirected
    if (data.to) {
      const message = {
        subject: email.subject,
        text: email['body-plain'],
        from: email.To,
        html: (
          email['body-html'] &&
          (!textonly ? email['body-html'] : '')
        ),
        to: data.to
      };

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

      // Forward message to user's main email
      await mailgun.messages().send(message);

      // Optionally save message to messages table
      if (save) saveMessage(req, false);
    }
    // Message must be saved since it's not being redirected
    else {
      saveMessage(req, false);
    }

    res.status(200).send();
  }
  catch (err) {
    res.status(406).send();
  }

};