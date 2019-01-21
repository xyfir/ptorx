import { createTransport, SendMailOptions } from 'nodemailer';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { simpleParser } from 'mailparser';
import { chargeUser } from 'lib/users/charge';
import { getMessage } from 'lib/messages/get';
import { filterMail } from 'lib/mail/filter';
import { modifyMail } from 'lib/mail/modify';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { saveMail } from 'lib/mail/save';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export interface AddressInfo {
  proxyEmailId?: Ptorx.ProxyEmail['id'];
  domainId?: number;
  message?: Ptorx.Message;
  address: string;
  userId?: number;
}

declare module 'smtp-server' {
  interface SMTPServerSession {
    to: AddressInfo[];
  }
}

declare module 'mailparser' {
  interface ParsedMail {
    headerLines: {
      key: string;
      line: string;
    }[];
  }
}

async function getAddressInfo(address: string): Promise<AddressInfo> {
  const [user, domain] = address.split('@');
  const db = new MySQL();
  try {
    // Reply-To address
    if (user.endsWith('--reply')) {
      try {
        const [userId, messageId, messageKey] = user.split('--');
        const message = await getMessage(+messageId, +userId);
        if (message.key != messageKey) throw new Error('Message key mismatch');
        return { address, message, userId: +userId };
      } catch (err) {
        // ** Send email response explaining problem
        throw new Error('Bad message reply address');
      }
    }
    // Check if proxy address
    else {
      const [row]: {
        proxyEmailId: Ptorx.ProxyEmail['id'];
        domainId: Ptorx.ProxyEmail['domainId'];
        userId: Ptorx.ProxyEmail['userId'];
      }[] = await db.query(
        `
          SELECT pxe.id AS proxyEmailId, pxe.userId, d.id AS domainId
          FROM domains d
          LEFT JOIN proxy_emails pxe ON
            pxe.domainId = d.id AND pxe.address = ? AND
            pxe.userId IS NOT NULL
          WHERE
            d.domain = ? AND d.verified = ?
        `,
        [user, domain, true]
      );
      db.release();

      // Not a verified Ptorx domain
      if (!row) return { address };
      // Not an active proxy email on verified Ptorx domain
      if (!row.proxyEmailId) throw new Error('User does not exist on domain');
      // Valid, active proxy email
      return { ...row, address };
    }
  } catch (err) {
    db.release();
    throw err;
  }
}

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
      session.to = session.to || [];
      session.to.push(await getAddressInfo(address.address));
      callback();
    } catch (err) {
      callback(err);
    }
  },
  async onData(stream, session, callback) {
    const original = await simpleParser(stream);

    // @ts-ignore
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
      headers: original.headerLines.map(h => ({
        key: h.key,
        value: h.line.substr(h.key.length + 2)
      })),
      sender: original.from.text,
      html: typeof original.html == 'string' ? original.html : undefined,
      from: original.from.text,
      text: original.text,
      date: original.date,
      to: original.to.text
      // replyTo: undefined,
      // dkim: undefined,
      // inReplyTo: undefined,
    };

    for (let recipient of session.to) {
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
        const transporter = createTransport({ sendmail: true });
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
          const transporter = createTransport({ sendmail: true });
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
