import { getPrimaryEmail } from 'lib/primary-emails/get';
import { SendMailOptions } from 'nodemailer';
import { chargeCredits } from 'lib/users/charge';
import { getRecipient } from 'lib/mail/get-recipient';
import { simpleParser } from 'mailparser';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { getAlias } from 'lib/aliases/get';
import { saveMail } from 'lib/mail/save';
import { sendMail } from 'lib/mail/send';
import { SRS } from 'sender-rewriting-scheme';

declare module 'mailparser' {
  interface ParsedMail {
    headerLines: { key: string; line: string }[];
  }
}

export function startMTA(): SMTPServer {
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

      let raw = '';
      stream.on('data', d => (raw += d));
      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });
      const incoming = await simpleParser(raw);

      if (stream.sizeExceeded) return callback(new Error('Message too big'));
      else callback();

      // Get index of DKIM-Signature header
      const dkimSignature = incoming.headerLines.findIndex(
        h => h.key.toLowerCase() == 'dkim-signature'
      );
      // Does DKIM-Signature sign Reply-To header?
      const isReplyToSigned =
        dkimSignature > -1 &&
        incoming.headerLines[dkimSignature].line
          .split(/\bh=/)[1]
          .split(';')[0]
          .split(':')
          .some(f => f.trim().toLowerCase() == 'reply-to');

      for (let address of recipients) {
        const recipient = await getRecipient(address);

        // Ignore if not for Ptorx
        if (!recipient.aliasId && !recipient.bounceTo && !recipient.message)
          continue;

        // Bounced message needs to be forwarded
        if (recipient.bounceTo) {
          await sendMail({
            envelope: { from: '', to: recipient.bounceTo },
            raw
          });
          continue;
        }

        // User does not have enough credits to accept this message
        if (recipient.user.credits < 1) continue;

        // Handle reply to a stored message
        if (recipient.message) {
          // User does not have enough credits to reply
          if (recipient.user.credits < 2) continue;

          const alias = await getAlias(
            recipient.message.aliasId,
            recipient.user.userId
          );

          await sendMail(
            {
              subject: incoming.subject,
              sender: alias.fullAddress,
              from: alias.fullAddress,
              html:
                typeof incoming.html == 'string' ? incoming.html : undefined,
              text: incoming.text,
              to: recipient.message.replyTo || recipient.message.from
            },
            alias.domainId
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
        const alias = await getAlias(recipient.aliasId, recipient.user.userId);
        const savedMessage =
          alias.saveMail && recipient.user.tier != 'basic'
            ? await saveMail(incoming, alias, recipient.user)
            : null;
        const domain = await getDomain(alias.domainId, alias.userId);

        for (let link of alias.links) {
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

            const replyTo = savedMessage
              ? savedMessage.ptorxReplyTo
              : outgoing.replyTo;
            const mail: SendMailOptions = {
              envelope: {
                from: mailFrom
                  ? srs.forward(mailFrom, domain.domain)
                  : alias.fullAddress,
                to: primaryEmail.address
              }
            };

            // Remail as from Ptorx with our own signature because some
            // necessary modification would break DKIM or because the original
            // message is not signed
            if (
              isModified ||
              dkimSignature == -1 ||
              (alias.canReply && isReplyToSigned)
            ) {
              Object.assign(mail, outgoing);
              mail.replyTo = replyTo;
              mail.from = `"${alias.name}" <${alias.fullAddress}>`;
              await sendMail(mail, alias.domainId);
            }
            // Forward mail as is with Reply-To that won't break DKIM
            else if (alias.canReply) {
              mail.raw = incoming.headers.has('reply-to')
                ? raw.replace(
                    new RegExp(`^Reply-To: ${outgoing.replyTo}`, 'im'),
                    `Reply-To: ${replyTo}`
                  )
                : `Reply-To: ${replyTo}\r\n` + raw;
              await sendMail(mail);
            }
            // Forward mail as is
            else {
              mail.raw = raw;
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
  server.listen(process.enve.MTA_PORT);
  return server;
}
