import { SendMailOptions, createTransport } from 'nodemailer';
import { getDomainAuth } from 'lib/domains/get';
import { Ptorx } from 'types/ptorx';

const transporter =
  typeof test != 'undefined'
    ? createTransport({
        secure: false,
        host: '127.0.0.1',
        port: process.enve.TEST_MTA_PORT,
        tls: { rejectUnauthorized: false }
      })
    : createTransport({ sendmail: true });

export async function sendMail(
  mail: SendMailOptions,
  domainId?: Ptorx.Domain['id']
): Promise<void> {
  const _mail: SendMailOptions = {
    ...mail,
    disableFileAccess: true,
    disableUrlAccess: true
  };

  if (domainId) {
    const domain = await getDomainAuth(domainId);
    _mail.dkim = {
      cacheDir: process.enve.MAIL_CACHE_DIRECTORY,
      domainName: domain.domain,
      privateKey: domain.privateKey,
      keySelector: domain.selector,
      cacheTreshold: 512 * 1000,
      headerFieldNames:
        'from:sender:reply-to:subject:date:message-id:to:cc:mime-version:content-type:content-transfer-encoding:content-id:content-description:resent-date:resent-from:resent-sender:resent-to:resent-cc:resent-message-id:in-reply-to:references:list-id:list-help:list-unsubscribe:list-subscribe:list-post:list-owner:list-archive'
    };
  }

  await transporter.sendMail(_mail);
}
