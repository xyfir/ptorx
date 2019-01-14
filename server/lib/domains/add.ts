import { editDomain } from 'lib/domains/edit';
import { getDomain } from 'lib/domains/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

/**
 * @todo Generate data needed to verify the domain
 * @todo Add current user to domain_users as authorized
 */
export async function addDomain(
  domain: Partial<Ptorx.Domain>,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();
  try {
    const result = await db.query('INSERT INTO domains SET ?', {
      userId,
      domain: domain.domain,
      created: moment().unix()
    });
    db.release();
    const _domain = await getDomain(result.insertId, userId);
    return await editDomain({ ..._domain, ...domain }, 1234);
  } catch (err) {
    db.release();
    throw err;
  }
}
