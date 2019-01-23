import { createTransport, SendMailOptions } from 'nodemailer';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { getRecipient } from 'lib/mail/get-recipient';
import { simpleParser } from 'mailparser';
import { chargeUser } from 'lib/users/charge';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { saveMail } from 'lib/mail/save';
import { Ptorx } from 'typings/ptorx';

declare module 'smtp-server' {
  interface SMTPServerSession {
    recipients: Ptorx.Recipient[];
  }
}
declare module 'mailparser' {
  interface ParsedMail {
    headerLines: { key: string; line: string }[];
  }
}

const transporter =
  typeof test != 'undefined'
    ? createTransport({
        host: '127.0.0.1',
        port: 2072,
        secure: false,
        tls: { rejectUnauthorized: false }
      })
    : createTransport({ sendmail: true });

const server = new SMTPServer({
  // secure: true,
  // key: fs.readFileSync('private.key'),
  // cert: fs.readFileSync('server.crt'),
  size: 25000000,
  logger: true,
  authMethods: [],
  authOptional: true,
  async onRcptTo(address, session, callback) {
    try {
      session.recipients = session.recipients || [];
      session.recipients.push(await getRecipient(address.address));
      callback();
    } catch (err) {
      callback(err);
    }
  },
  async onData(stream, session, callback) {
    const original = await simpleParser(stream);
    if (stream.sizeExceeded) return callback(new Error('Message too big'));

    const modified: SendMailOptions = {
      disableFileAccess: true,
      disableUrlAccess: true,
      /** @todo Remove after DefinitelyTyped#32291 is solved */
      // @ts-ignore
      attachments: original.attachments.map(a => ({
        contentDisposition: a.contentDisposition,
        contentType: a.contentType,
        // headers also shared but needs conversion
        filename: a.filename,
        content: a.content,
        cid: a.cid
      })),
      subject: original.subject,
      headers: original.headerLines
        .map(h => ({
          key: h.key,
          value: h.line.substr(h.key.length + 2)
        }))
        // Prevent duplicate Content-Types which can cause parsing issues
        .filter(h => h.key != 'content-type'),
      sender: original.from.text,
      html: typeof original.html == 'string' ? original.html : undefined,
      from: original.from.text,
      text: original.text,
      date: original.date,
      to: original.to.text
      // replyTo: undefined,
      // dkim: undefined,
      // inReplyTo: undefined
    };

    for (let recipient of session.recipients) {
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
        await transporter.sendMail({
          subject: original.subject,
          sender: fullAddress,
          from: fullAddress,
          html: typeof original.html == 'string' ? original.html : undefined,
          text: original.text,
          to: recipient.message.from
        });

        await chargeUser(proxyEmail.userId, 2);
        continue;
      }

      const proxyEmail = await getProxyEmail(
        recipient.proxyEmailId,
        recipient.userId
      );
      await chargeUser(proxyEmail.userId, 1);

      const savedMessage = proxyEmail.saveMail
        ? await saveMail(original, proxyEmail)
        : null;

      for (let link of proxyEmail.links) {
        // Filter mail
        if (link.filterId) {
          // Stop waterfall if filter did not pass
          const pass = await filterMail(
            original,
            link.filterId,
            recipient.userId
          );
          if (!pass) break;
        }
        // Modify mail
        else if (link.modifierId) {
          await modifyMail(modified, link.modifierId, recipient.userId);
        }
        // Forward mail
        else if (link.primaryEmailId) {
          const primaryEmail = await getPrimaryEmail(
            link.primaryEmailId,
            recipient.userId
          );
          await transporter.sendMail({
            ...modified,
            replyTo: savedMessage
              ? `${recipient.userId}--${savedMessage.id}--${
                  savedMessage.key
                }--reply@${recipient.address.split('@')[1]}`
              : undefined,
            sender: recipient.address,
            from: recipient.address,
            to: primaryEmail.address
          });
          await chargeUser(recipient.userId, 1);
        }
      }
    }

    callback();
  }
});

server.on('error', console.error);
server.listen(2071);
