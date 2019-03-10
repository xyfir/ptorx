import { checkProxyEmail } from 'lib/proxy-emails/check';
import { editProxyEmail } from 'lib/proxy-emails/edit';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { listDomains } from 'lib/domains/list';
import * as moment from 'moment';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';
import { rword } from 'rword';

export async function addProxyEmail(
  proxyEmail: Partial<Ptorx.ProxyEmail>,
  userId: number
): Promise<Ptorx.ProxyEmail> {
  const db = new MySQL();
  try {
    const domains = await listDomains(userId);
    if (domains.findIndex(d => d.id == proxyEmail.domainId) == -1)
      throw 'You cannot use that domain';

    // Generate an available address
    if (!proxyEmail.address) {
      proxyEmail.address = rword.generateFromPool(1) as string;
      while (true) {
        proxyEmail.address += Date.now()
          .toString()
          .substr(-2);
        const { available } = await checkProxyEmail(
          proxyEmail.domainId,
          proxyEmail.address
        );
        if (available) break;
      }
    }
    // Make sure address exists
    else {
      proxyEmail.address = proxyEmail.address.toLowerCase();

      if (proxyEmail.address) {
        if (!/^[\w\-]{1,64}$/.test(proxyEmail.address))
          throw 'Bad address: must 1-64 alphanumerical characters';
        if (proxyEmail.address.startsWith('x-'))
          throw 'Bad address: cannot start with "x-"';
        if (proxyEmail.address.endsWith('-x'))
          throw 'Bad address: cannot end with "-x"';
        if (proxyEmail.address.indexOf('--') > -1)
          throw 'Bad address: cannot contain two or more consecutive hyphens';
        if (proxyEmail.address.indexOf('__') > -1)
          throw 'Bad address: cannot contain two or more consecutive underscores';
        if (proxyEmail.address.startsWith('srs'))
          throw 'Bad address: cannot start with srs';
      }

      const { available } = await checkProxyEmail(
        proxyEmail.domainId,
        proxyEmail.address
      );
      if (!available) throw 'Email is already in use';
    }

    const insert: Partial<Ptorx.ProxyEmail> = {
      userId,
      created: moment().unix(),
      address: proxyEmail.address,
      domainId: proxyEmail.domainId
    };
    const result = await db.query('INSERT INTO proxy_emails SET ?', insert);
    const _proxyEmail = await getProxyEmail(result.insertId, userId);

    db.release();
    return await editProxyEmail({ ..._proxyEmail, ...proxyEmail }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
