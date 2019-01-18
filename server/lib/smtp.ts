import { getPrimaryEmail } from 'lib/primary-emails/get';
import { createTransport } from 'nodemailer';
import * as escapeRegExp from 'escape-string-regexp';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { simpleParser } from 'mailparser';
import { getModifier } from 'lib/modifiers/get';
import { SMTPServer } from 'smtp-server';
import { getFilter } from 'lib/filters/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

interface AddressInfo {
  proxyEmailId?: Ptorx.ProxyEmail['id'];
  domainId?: number;
  address: string;
  userId?: number;
}

declare module 'smtp-server' {
  interface SMTPServerSession {
    ptorx: {
      action: 'send' | 'receive';
      from: AddressInfo;
      to: AddressInfo[];
    };
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

    // Not a verified Ptorx domain
    if (!row) return { address };
    // Not an active proxy email on verified Ptorx domain
    if (!row.proxyEmailId) throw new Error('User does not exist on domain');
    // Valid, active proxy email
    return { ...row, address };
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
  async onMailFrom(address, session, callback) {
    try {
      const from = await getAddressInfo(address.address);

      if (from.proxyEmailId && session.remoteAddress != '127.0.0.1')
        return callback(new Error('You are not authorized to send mail'));

      session.ptorx = {
        action: from.proxyEmailId ? 'send' : 'receive',
        from,
        to: []
      };
      callback();
    } catch (err) {
      callback(err);
    }
  },
  async onRcptTo(address, session, callback) {
    try {
      session.ptorx.to.push(await getAddressInfo(address.address));
      callback();
    } catch (err) {
      callback(err);
    }
  },
  async onData(stream, session, callback) {
    // A proxy email is sending out mail, no further action needed
    if (session.ptorx.from.proxyEmailId) return callback();

    const message = await simpleParser(stream);

    // @ts-ignore
    if (stream.sizeExceeded) return callback(new Error('Message too big'));

    for (let recipient of session.ptorx.to) {
      // Ignore if not for Ptorx
      if (!recipient.proxyEmailId) continue;

      const proxyEmail = await getProxyEmail(
        recipient.proxyEmailId,
        recipient.userId
      );

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
              pass = regex.test(message.subject);
              break;
            case 'address':
              pass = regex.test(recipient.address);
              break;
            case 'text':
              pass = regex.test(message.text);
              break;
            case 'html':
              pass =
                message.html === false
                  ? false
                  : regex.test(message.html as string);
              break;
            case 'header':
              pass =
                message.headerLines.map(h => regex.test(h.line)).filter(h => h)
                  .length > 0;
              break;
          }

          // Flip value if blacklist
          if (filter.blacklist) pass = !pass;

          // Stop waterfall if filter did not pass
          if (pass) {
            // ** save mail if needed
            break;
          }
        }
        // Modify mail
        else if (link.modifierId) {
        }
        // Forward mail
        else if (link.primaryEmailId) {
        }
      }

      // ** Save to database if needed
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
