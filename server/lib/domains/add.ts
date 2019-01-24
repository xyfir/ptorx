import { editDomainUser } from 'lib/domains/users/edit';
import { addDomainUser } from 'lib/domains/users/add';
import { editDomain } from 'lib/domains/edit';
import { getDomain } from 'lib/domains/get';
import * as moment from 'moment';
import * as forge from 'node-forge';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import { rword } from 'rword';

export async function addDomain(
  domain: Partial<Ptorx.Domain>,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();
  try {
    const keypair: forge.pki.rsa.KeyPair = await new Promise(
      (resolve, reject) =>
        forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) =>
          err ? reject(err) : resolve(keypair)
        )
    );

    const insert: Partial<Ptorx.Domain> = {
      userId,
      domain: domain.domain,
      privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
      publicKey: `v=DKIM1; k=rsa; p=${forge.pki
        .publicKeyToPem(keypair.publicKey)
        .split('-----')[2]
        .split('\n')
        .join('')}`,
      selector:
        (rword.generateFromPool(1) as string) +
        Date.now()
          .toString()
          .slice(-2),
      created: moment().unix()
    };
    const result = await db.query('INSERT INTO domains SET ?', insert);
    db.release();

    const _domain = await getDomain(result.insertId, userId);

    const domainUser = await addDomainUser(_domain.domain, userId);
    await editDomainUser({ ...domainUser, authorized: true }, userId);

    return await editDomain({ ..._domain, ...domain }, 1234);
  } catch (err) {
    db.release();
    throw err;
  }
}
