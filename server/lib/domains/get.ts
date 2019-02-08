import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getDomain(
  domainId: number,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();
  try {
    const [domain]: Ptorx.Domain[] = await db.query(
      `
        SELECT
          id, userId, domain, publicKey, selector, created, verified, global,
          userId = ? AS isCreator
        FROM domains WHERE id = ?
      `,
      [userId, domainId]
    );
    db.release();
    if (!domain) throw 'Could not find domain';
    domain.isCreator = !!domain.isCreator;
    domain.verified = !!domain.verified;
    domain.global = !!domain.global;
    return domain;
  } catch (err) {
    db.release();
    throw err;
  }
}

export async function getDomainAuth(
  domainId: number
): Promise<Ptorx.DomainAuth> {
  const db = new MySQL();
  try {
    const [domainAuth]: Ptorx.DomainAuth[] = await db.query(
      `
        SELECT domain, publicKey, privateKey, selector
        FROM domains WHERE id = ?
      `,
      [domainId]
    );
    db.release();
    if (!domainAuth) throw 'Could not find domain';
    return domainAuth;
  } catch (err) {
    db.release();
    throw err;
  }
}
