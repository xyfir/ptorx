import { getPrimaryEmail } from 'lib/primary-emails/get';
import { SendMailOptions } from 'nodemailer';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { getRecipient } from 'lib/mail/get-recipient';
import { simpleParser } from 'mailparser';
import { chargeCredits } from 'lib/users/charge';
import { readFileSync } from 'fs';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { saveMail } from 'lib/mail/save';
import { sendMail } from 'lib/mail/send';

declare module 'mailparser' {
  interface ParsedMail {
    headerLines: { key: string; line: string }[];
  }
}

export function startSMTPServer(): SMTPServer {
  // Load cert/key from files if needed
  const { SMTP_SERVER_OPTIONS } = process.enve;
  let { cert, key } = SMTP_SERVER_OPTIONS;
  if (cert && !cert.startsWith('-----'))
    SMTP_SERVER_OPTIONS.cert = readFileSync(cert);
  if (key && !key.startsWith('-----'))
    SMTP_SERVER_OPTIONS.key = readFileSync(key);

  const server = new SMTPServer({
    ...process.enve.SMTP_SERVER_OPTIONS,
    authOptional: true,
    size: 25000000,
    async onData(stream, session, callback) {
      const recipients = session.envelope.rcptTo.map(r => r.address);
      const incoming = await simpleParser(stream);

      if (stream.sizeExceeded) return callback(new Error('Message too big'));
      else callback();

      // Check if the message has a DKIM signature and whether the Reply-To
      // header is part of it
      let hasDKIM = false;
      const replyToSigned =
        incoming.headerLines.findIndex(h => {
          if (h.key.toLowerCase() != 'dkim-signature') return false;
          hasDKIM = true;
          return (
            h.line
              .split(/\bh=/)[1]
              .split(';')[0]
              .split(':')
              .findIndex(f => f.trim().toLowerCase() == 'reply-to') > -1
          );
        }) > -1;

      for (let address of recipients) {
        const recipient = await getRecipient(address);

        // Ignore if not for Ptorx
        if (!recipient.proxyEmailId && !recipient.message) continue;

        // User does not have enough credits to accept this message
        if (recipient.user.credits < 1) continue;

        // Handle reply to a stored message
        if (recipient.message) {
          // User does not have enough credits to reply
          if (recipient.user.credits < 2) continue;

          const proxyEmail = await getProxyEmail(
            recipient.message.proxyEmailId,
            recipient.user.userId
          );

          await sendMail(
            {
              subject: incoming.subject,
              sender: proxyEmail.fullAddress,
              from: proxyEmail.fullAddress,
              html:
                typeof incoming.html == 'string' ? incoming.html : undefined,
              text: incoming.text,
              to: recipient.message.replyTo || recipient.message.from
            },
            proxyEmail.domainId
          );

          await chargeCredits(recipient.user, 2);
          continue;
        }

        const outgoing: SendMailOptions = {
          /** @todo Remove after DefinitelyTyped#32291 is solved */
          // @ts-ignore
          attachments: incoming.attachments.map(a => ({
            contentDisposition: a.contentDisposition,
            contentType: a.contentType,
            // headers also shared but needs conversion
            filename: a.filename,
            content: a.content,
            cid: a.cid
          })),
          replyTo: incoming.replyTo ? incoming.replyTo.text : undefined,
          headers: incoming.headerLines
            .map(h => ({
              key: h.key,
              value: h.line.substr(h.key.length + 2)
            }))
            // Prevent duplicate Content-Types which can cause parsing issues
            .filter(h => h.key != 'content-type'),
          subject: incoming.subject,
          sender: incoming.from.text,
          html: typeof incoming.html == 'string' ? incoming.html : undefined,
          from: incoming.from.text,
          text: incoming.text,
          date: incoming.date,
          to: incoming.to.text
        };

        let credits = 1;
        let isModified = false;
        const proxyEmail = await getProxyEmail(
          recipient.proxyEmailId,
          recipient.user.userId
        );
        const savedMessage =
          proxyEmail.saveMail && recipient.user.tier != 'basic'
            ? await saveMail(incoming, proxyEmail)
            : null;

        for (
          let linkIndex = 0;
          linkIndex < proxyEmail.links.length;
          linkIndex++
        ) {
          const link = proxyEmail.links[linkIndex];

          // Filter mail
          if (link.filterId) {
            // Stop waterfall if filter did not pass
            const pass = await filterMail(
              incoming,
              link.filterId,
              recipient.user.userId
            );
            if (!pass) break;
          }
          // Modify mail
          else if (link.modifierId) {
            await modifyMail(outgoing, link.modifierId, recipient.user.userId);
            isModified = true;
          }
          // Forward mail
          else if (link.primaryEmailId) {
            const primaryEmail = await getPrimaryEmail(
              link.primaryEmailId,
              recipient.user.userId
            );
            if (!primaryEmail.verified) continue;

            // User does not have enough credits to redirect message
            if (recipient.user.credits < credits + 1) continue;

            const mail: SendMailOptions = {
              ...outgoing,
              envelope: { to: primaryEmail.address },
              replyTo: savedMessage
                ? savedMessage.ptorxReplyTo
                : outgoing.replyTo
            };

            // Send mail from Ptorx with our own signature because:
            // - the modified mail would break DKIM
            // - and/or setting Reply-To would break DKIM
            if (hasDKIM && (isModified || (savedMessage && replyToSigned))) {
              mail.from = `"${proxyEmail.name}" <${proxyEmail.fullAddress}>`;
              mail.envelope.from = recipient.address;
              await sendMail(mail, proxyEmail.domainId);
            }
            // Redirect mail as is without changing sender and DKIM signature
            // SPF will fail but DKIM and alignment are fine
            else {
              if (session.envelope.mailFrom)
                mail.envelope.from = session.envelope.mailFrom.address;
              await sendMail(mail);
            }
            credits++;
          }
        }

        await chargeCredits(recipient.user, credits);
      }
    }
  });
  server.on('error', console.error);
  server.listen(process.enve.SMTP_PORT);
  return server;
}
