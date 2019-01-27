import { getPrimaryEmail } from 'lib/primary-emails/get';
import { SendMailOptions } from 'nodemailer';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { getRecipient } from 'lib/mail/get-recipient';
import { simpleParser } from 'mailparser';
import { chargeUser } from 'lib/users/charge';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { saveMail } from 'lib/mail/save';
import { sendMail } from 'lib/mail/send';
import * as CONFIG from 'constants/config';

declare module 'mailparser' {
  interface ParsedMail {
    headerLines: { key: string; line: string }[];
  }
}

const server = new SMTPServer({
  ...CONFIG.SMTP_SERVER_OPTIONS,
  authOptional: true,
  size: 25000000,
  async onData(stream, session, callback) {
    const incoming = await simpleParser(stream);
    if (stream.sizeExceeded) return callback(new Error('Message too big'));

    for (let { address } of session.envelope.rcptTo) {
      const recipient = await getRecipient(address);

      // Ignore if not for Ptorx
      if (!recipient.proxyEmailId && !recipient.message) continue;

      // Handle reply to a stored message
      if (recipient.message) {
        const proxyEmail = await getProxyEmail(
          recipient.message.proxyEmailId,
          recipient.userId
        );
        const domain = await getDomain(proxyEmail.domainId, proxyEmail.userId);

        const fullAddress = `${proxyEmail.address}@${domain.domain}`;
        await sendMail(domain.id, {
          subject: incoming.subject,
          sender: fullAddress,
          from: fullAddress,
          html: typeof incoming.html == 'string' ? incoming.html : undefined,
          text: incoming.text,
          to: recipient.message.replyTo || recipient.message.from
        });

        await chargeUser(proxyEmail.userId, 2);
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

      const proxyEmail = await getProxyEmail(
        recipient.proxyEmailId,
        recipient.userId
      );
      await chargeUser(proxyEmail.userId, 1);

      const savedMessage = proxyEmail.saveMail
        ? await saveMail(incoming, proxyEmail)
        : null;

      for (let link of proxyEmail.links) {
        // Filter mail
        if (link.filterId) {
          // Stop waterfall if filter did not pass
          const pass = await filterMail(
            incoming,
            link.filterId,
            recipient.userId
          );
          if (!pass) break;
        }
        // Modify mail
        else if (link.modifierId) {
          await modifyMail(outgoing, link.modifierId, recipient.userId);
        }
        // Forward mail
        else if (link.primaryEmailId) {
          const primaryEmail = await getPrimaryEmail(
            link.primaryEmailId,
            recipient.userId
          );
          await sendMail(proxyEmail.domainId, {
            ...outgoing,
            envelope: {
              from: recipient.address,
              to: primaryEmail.address
            },
            replyTo: savedMessage
              ? `${recipient.userId}--${savedMessage.id}--${
                  savedMessage.key
                }--reply@${recipient.address.split('@')[1]}`
              : outgoing.replyTo
          });
          await chargeUser(recipient.userId, 1);
        }
      }
    }

    callback();
  }
});

server.on('error', console.error);
server.listen(CONFIG.SMTP_PORT);
