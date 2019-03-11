import { getPrimaryEmail } from 'lib/primary-emails/get';
import { SendMailOptions } from 'nodemailer';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { chargeCredits } from 'lib/users/charge';
import { getRecipient } from 'lib/mail/get-recipient';
import { simpleParser } from 'mailparser';
import { readFileSync } from 'fs';
import { PassThrough } from 'stream';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { saveMail } from 'lib/mail/save';
import { sendMail } from 'lib/mail/send';
import { SRS } from 'sender-rewriting-scheme';

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

  const srs = new SRS({ secret: process.enve.SRS_KEY });

  const server = new SMTPServer({
    ...process.enve.SMTP_SERVER_OPTIONS,
    authOptional: true,
    size: 25000000,
    async onData(stream, session, callback) {
      const recipients = session.envelope.rcptTo.map(r => r.address);
      const mailFrom = session.envelope.mailFrom
        ? session.envelope.mailFrom.address
        : null;

      const _stream = new PassThrough();
      stream.pipe(_stream);
      const incoming = await simpleParser(stream);

      if (stream.sizeExceeded) return callback(new Error('Message too big'));
      else callback();

      const dkimSignature = incoming.headerLines.findIndex(
        h => h.key.toLowerCase() == 'dkim-signature'
      );
      const canPrependReplyTo =
        // Reply-To cannot already exist
        incoming.headerLines.findIndex(
          h => h.key.toLowerCase() == 'reply-to'
        ) == -1 &&
        // Message cannot have a DKIM-Signature where Reply-To is signed
        (dkimSignature == -1 ||
          incoming.headerLines[dkimSignature].line
            .split(/\bh=/)[1]
            .split(';')[0]
            .split(':')
            .findIndex(f => f.trim().toLowerCase() == 'reply-to') == -1);

      for (let address of recipients) {
        const recipient = await getRecipient(address);

        // Ignore if not for Ptorx
        if (
          !recipient.proxyEmailId &&
          !recipient.bounceTo &&
          !recipient.message
        )
          continue;

        // User does not have enough credits to accept this message
        if (recipient.user && recipient.user.credits < 1) continue;

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

        // Bounced message needs to be forwarded
        if (recipient.bounceTo) {
          await sendMail({
            ...outgoing,
            envelope: { from: '', to: recipient.bounceTo }
          });
          continue;
        }

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
        const domain = await getDomain(proxyEmail.domainId, proxyEmail.userId);

        for (let link of proxyEmail.links) {
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

            const replyTo =
              proxyEmail.saveMail && proxyEmail.canReply
                ? savedMessage.ptorxReplyTo
                : outgoing.replyTo;
            const mail: SendMailOptions = {
              envelope: {
                from: mailFrom
                  ? srs.forward(mailFrom, domain.domain)
                  : proxyEmail.fullAddress,
                to: primaryEmail.address
              }
            };

            // Send mail from Ptorx with our own signature because:
            // - the modifiers would break DKIM
            // - and/or changing Reply-To would break DKIM
            if (isModified || (proxyEmail.canReply && !canPrependReplyTo)) {
              Object.assign(mail, outgoing);
              mail.replyTo = replyTo;
              mail.from = `"${proxyEmail.name}" <${proxyEmail.fullAddress}>`;
              await sendMail(mail, proxyEmail.domainId);
            }
            // Redirect mail as is with Reply-To that won't break DKIM
            else if (proxyEmail.canReply) {
              const raw = new PassThrough();
              raw.write(`Reply-To: ${replyTo}\r\n`);
              _stream.pipe(raw);
              mail.raw = raw;
              await sendMail(mail);
            }
            // Redirect mail as is
            else {
              mail.raw = _stream;
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
