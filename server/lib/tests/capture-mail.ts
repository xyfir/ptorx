import { SMTPServer, SMTPServerSession } from 'smtp-server';
import { simpleParser, ParsedMail } from 'mailparser';
import * as CONFIG from 'constants/config';

export async function captureMail(
  expected: number,
  fn: (message: ParsedMail, session: SMTPServerSession) => void
): Promise<void> {
  let received = 0;
  let server: SMTPServer;
  try {
    server = new SMTPServer({
      authOptional: true,
      async onData(stream, session, callback) {
        const message = await simpleParser(stream);
        fn(message, session);
        callback();
        if (++received >= expected) server.close(() => 1);
      }
    });
    server.on('error', e => {
      throw e;
    });
    server.listen(CONFIG.TEST_SMTP_PORT);
  } catch (err) {
    server && server.close(() => 1);
  }
}
