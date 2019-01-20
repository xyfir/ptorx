import { createTransport, SendMailOptions } from 'nodemailer';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import * as escapeRegExp from 'escape-string-regexp';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { simpleParser } from 'mailparser';
import { getModifier } from 'lib/modifiers/get';
import { getMessage } from 'lib/messages/get';
import { addMessage } from 'lib/messages/add';
import { SMTPServer } from 'smtp-server';
import { getDomain } from 'lib/domains/get';
import { getFilter } from 'lib/filters/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

interface AddressInfo {
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
      // envelope: undefined,
      // inReplyTo: undefined,
    };

    for (let recipient of session.to) {
      // Ignore if not for Ptorx
      if (!recipient.proxyEmailId && !recipient.message) continue;

      const proxyEmail = await getProxyEmail(
        recipient.proxyEmailId,
        recipient.userId
      );

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
        continue;
      }

      // Save message
      let savedMessage: Ptorx.Message;
      if (proxyEmail.saveMail) {
        savedMessage = await addMessage(
          {
            attachments: original.attachments.map(a => ({
              filename: a.filename,
              contentType: a.contentType,
              content: a.content,
              size: a.content.byteLength
            })),
            from: original.from.text,
            headers: original.headerLines.map(h => h.line),
            html: typeof original.html == 'string' ? original.html : undefined,
            proxyEmailId: proxyEmail.id,
            subject: original.subject,
            text: original.text,
            to: original.to.text
          },
          proxyEmail.userId
        );
      }

      for (let link of proxyEmail.links) {
        // Filter mail
        if (link.filterId) {
          const filter = await getFilter(link.filterId, recipient.userId);
          let pass = false;

          // Escape regex if filter is not using regex
          if (!filter.regex && filter.type != 'header')
            filter.find = escapeRegExp(filter.find);

          const regex = new RegExp(filter.find);
          switch (filter.type) {
            case 'subject':
              pass = regex.test(original.subject);
              break;
            case 'address':
              pass = regex.test(recipient.address);
              break;
            case 'text':
              pass = regex.test(original.text);
              break;
            case 'html':
              pass =
                original.html === false
                  ? false
                  : regex.test(original.html as string);
              break;
            case 'header':
              pass =
                original.headerLines.map(h => regex.test(h.line)).filter(h => h)
                  .length > 0;
              break;
          }

          // Flip value if blacklist
          if (filter.blacklist) pass = !pass;

          // Stop waterfall if filter did not pass
          if (!pass) break;
        }
        // Modify mail
        else if (link.modifierId) {
          const modifier = await getModifier(link.modifierId, recipient.userId);
          switch (modifier.type) {
            case 'text-only':
              delete modified.html;
              break;
            case 'replace':
              // Escape search if not regular expression
              modifier.find = !modifier.regex
                ? escapeRegExp(modifier.find)
                : modifier.replacement;
              // Escape '$' if not regular expression
              modifier.replacement = !modifier.regex
                ? modifier.replacement.replace(/\$/g, '$$')
                : modifier.replacement;
              // Replace text in body text and html
              modified.text = (modified.text as string).replace(
                new RegExp(modifier.find, modifier.flags),
                modifier.replacement
              );
              modified.html =
                modified.html &&
                (modified.html as string).replace(
                  new RegExp(modifier.find, modifier.flags),
                  modifier.replacement
                );
              break;
            case 'subject':
              modified.subject = modifier.subject;
              break;
            case 'tag':
              modified.subject = modifier.prepend
                ? modifier.tag + modified.subject
                : modified.subject + modifier.tag;
              break;
            case 'concat':
              modified[modifier.to] = modifier.prepend
                ? modified[modifier.add] +
                  modifier.separator +
                  modified[modifier.to]
                : modified[modifier.to] +
                  modifier.separator +
                  modified[modifier.add];
              break;
            case 'builder':
              modified[modifier.target] = modifier.template
                .replace(
                  /{{html}}/g,
                  typeof modified.html == 'string' ? modified.html : ''
                )
                .replace(/{{text}}/g, modified.text as string)
                .replace(/{{sender}}/g, modified.from as string)
                .replace(/{{subject}}/g, modified.subject)
                .replace(
                  /{{header\('(.+)', '(.+)'\)}}/g,
                  (m, p1: string, p2: string): string => {
                    const header = original.headerLines.find(h => h.key == p1);
                    return header
                      ? header.line.substr(header.key.length + 2)
                      : p2;
                  }
                );
          }
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
              ? `${proxyEmail.userId}--${savedMessage.id}--${
                  savedMessage.key
                }--reply@${recipient.address.split('@')[1]}`
              : undefined,
            sender: recipient.address,
            from: recipient.address,
            to: primaryEmail.address
          });
        }
      }
    }

    callback();
  }
});

server.on('error', console.error);

server.listen(2071);

export const smtp = async () => {
  try {
    const transporter = createTransport({
      host: '127.0.0.1',
      port: 2071,
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });
    const info = await transporter.sendMail({
      // from: '"Me" <ejection81@test.ptorx.com>',
      // to: 'foo@example',
      from: '"You" <foo@example.com>',
      to: 'ejection81@test.ptorx.com',
      subject: 'Hi',
      text: 'Hello world?',
      html: '<b>Hello world?</b>'
    });
    console.log(info);
  } catch (err) {
    console.error(err);
  }
};
