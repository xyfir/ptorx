import { SMTPServerSession, SMTPServer } from 'smtp-server';
import { SendMailOptions } from 'nodemailer';
import { readFileSync } from 'fs';
import { sendMail } from 'lib/mail/send';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

declare module 'smtp-server' {
  interface SMTPServerSession {
    user: {
      domainId: Ptorx.Alias['domainId'];
      userId: Ptorx.Alias['userId'];
      alias: Ptorx.Alias['fullAddress'];
    };
  }
}

export function startMSA(): SMTPServer {
  const { SMTP_SERVER_OPTIONS, MSA_PORT } = process.enve;
  const db = new MySQL();

  // Load cert/key from files if needed
  let { cert, key } = SMTP_SERVER_OPTIONS;
  if (cert && !cert.startsWith('-----'))
    SMTP_SERVER_OPTIONS.cert = readFileSync(cert);
  if (key && !key.startsWith('-----'))
    SMTP_SERVER_OPTIONS.key = readFileSync(key);

  const server = new SMTPServer({
    ...SMTP_SERVER_OPTIONS,
    authMethods: ['PLAIN', 'LOGIN'],
    async onAuth(auth, session, callback) {
      const [local, domain] = auth.username.split('@');
      const [row]: SMTPServerSession['user'][] = await db.query(
        `
          SELECT a.userId, a.domainId
          FROM domains d, aliases a
          WHERE
            d.domain = ? AND d.verified = 1 AND
            a.domainId = d.id AND a.address = ? AND
            a.smtpKey != '' AND a.smtpKey = ?
        `,
        [domain, local, auth.password]
      );
      db.release();

      if (!row) return callback(new Error('Bad auth'));

      const user = await getUser(row.userId);
      if (user.credits < 1) return callback(new Error('Not enough credits'));
      if (user.tier == 'basic') return callback(new Error('Not a paid user'));

      callback(null, { user: { ...row, alias: auth.username } });
    },
    async onData(stream, session, callback) {
      let raw = '';
      stream.on('data', d => (raw += d));
      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      const envelope: SendMailOptions['envelope'] = {
        from: session.user.alias,
        to: session.envelope.rcptTo.map(r => r.address)
      };

      if (stream.sizeExceeded) return callback(new Error('Message too big'));
      else callback();

      await sendMail({ raw, envelope }, session.user.domainId);
    }
  });
  server.on('error', console.error);
  server.listen(MSA_PORT);
  return server;
}
