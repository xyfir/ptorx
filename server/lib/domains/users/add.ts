import { getDomainUser } from 'lib/domains/users/get';
import { Ptorx } from 'types/ptorx';
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

    const insert: Partial<Ptorx.DomainUser> = {
      requestKey: uuid(),
      domainId,
      userId
    };
    await db.query(
      `
        INSERT INTO domain_users SET ?
        ON DUPLICATE KEY UPDATE requestKey = '${insert.requestKey}'
      `,
      insert
    );

    db.release();
    return await getDomainUser(domainId, insert.requestKey, domainUserId);
  } catch (err) {
    db.release();
    throw err;
  }
}
