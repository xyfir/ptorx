import { SMTPServer, SMTPServerSession } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import * as CONFIG from 'constants/config';

export function captureMail(
  expected: number,
  fn: (message: ParsedMail, session: SMTPServerSession) => void
): Promise<void> {
  return new Promise(resolve => {
    let received = 0;
    let server: SMTPServer;
    try {
      server = new SMTPServer({
        authOptional: true,
        async onData(stream, session, callback) {
          const message = await simpleParser(stream);
          fn(message, session);
          callback();
          if (++received >= expected) server.close(resolve);
        }
      });
      server.on('error', e => {
        throw e;
      });
      server.listen(CONFIG.TESTS.SMTP_PORT);
    } catch (err) {
      server ? server.close(resolve) : resolve();
    }
  });
}
