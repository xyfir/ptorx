import { SendMailOptions, createTransport } from 'nodemailer';
import { getDomainAuth } from 'lib/domains/get';
import * as CONFIG from 'constants/config';
import { Ptorx } from 'typings/ptorx';

const transporter =
  typeof test != 'undefined'
    ? createTransport({
        host: '127.0.0.1',
        port: 2072,
        secure: false,
        tls: { rejectUnauthorized: false }
      })
    : createTransport({ sendmail: true });

export async function sendMail(
  domainId: Ptorx.Domain['id'],
  mail: SendMailOptions
): Promise<void> {
  const domain = await getDomainAuth(domainId);
  await transporter.sendMail({
    ...mail,
    disableFileAccess: true,
    disableUrlAccess: true,
    dkim: {
      cacheDir: CONFIG.DIRECTORIES.MAIL_CACHE,
      domainName: domain.domain,
      privateKey: domain.privateKey,
      keySelector: domain.selector,
      cacheTreshold: 512 * 1000,
      headerFieldNames:
        'from:sender:reply-to:subject:date:message-id:to:cc:mime-version:content-type:content-transfer-encoding:content-id:content-description:resent-date:resent-from:resent-sender:resent-to:resent-cc:resent-message-id:in-reply-to:references:list-id:list-help:list-unsubscribe:list-subscribe:list-post:list-owner:list-archive'
    }
  });
}
