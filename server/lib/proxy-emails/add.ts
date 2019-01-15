import { checkProxyEmail } from 'lib/proxy-emails/check';
import { editProxyEmail } from 'lib/proxy-emails/edit';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { listDomains } from 'lib/domains/list';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
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
    if (proxyEmail.address == '') {
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
      const { available } = await checkProxyEmail(
        proxyEmail.domainId,
        proxyEmail.address
      );
      if (!available) throw 'Email is already in use';
    }

    const result = await db.query('INSERT INTO proxy_emails SET ?', {
      userId,
      created: moment().unix(),
      address: proxyEmail.address,
      domainId: proxyEmail.domainId
    });
    const _proxyEmail = await getProxyEmail(result.insertId, userId);

    db.release();
    return await editProxyEmail({ ..._proxyEmail, ...proxyEmail }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
