import { getDomainUser } from 'lib/domains/users/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function addDomainUser(
  domain: Ptorx.Domain['domain'],
  userId: number
): Promise<Ptorx.DomainUser> {
  const db = new MySQL();
  try {
    const [{ domainId, domainUserId }]: {
      domainId: Ptorx.Domain['id'];
      domainUserId: Ptorx.Domain['userId'];
    }[] = await db.query(
      `
        SELECT id AS domainId, userId AS domainUserId
        FROM domains WHERE domain = ?
      `,
      [domain]
    );

    const key = uuid();
    await db.query(
      `
        INSERT INTO domain_users SET ?
        ON DUPLICATE KEY UPDATE requestKey = '${key}'
      `,
      { requestKey: key, domainId, userId }
    );

    db.release();
    return await getDomainUser(domainId, key, domainUserId);
  } catch (err) {
    db.release();
    throw err;
  }
}
