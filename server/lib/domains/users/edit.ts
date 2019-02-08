import { getDomainUser } from 'lib/domains/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editDomainUser(
  domainUser: Ptorx.DomainUser,
  /** User id of domain owner */
  userId: number
): Promise<Ptorx.DomainUser> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE domain_users SET label = ?, authorized = ?
        WHERE
          domainId = ? AND requestKey = ? AND
          (SELECT userId FROM domains WHERE id = ?) = ?
      `,
      [
        domainUser.label,
        domainUser.authorized,
        domainUser.domainId,
        domainUser.requestKey,
        domainUser.domainId,
        userId
      ]
    );
    db.release();
    if (!result.affectedRows) throw 'Could not edit domain user';
    return await getDomainUser(
      domainUser.domainId,
      domainUser.requestKey,
      userId
    );
  } catch (err) {
    db.release();
    throw err;
  }
}
