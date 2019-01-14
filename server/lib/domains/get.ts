import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getDomain(
  domainId: number,
  userId: number
): Promise<Ptorx.Domain> {
  const db = new MySQL();

  try {
    const [domain]: Ptorx.Domain[] = await db.query(
      'SELECT *, userId = ? AS isCreator FROM domains WHERE id = ?',
      [userId, domainId]
    );
    db.release();
    if (!domain) throw 'Could not find domain';
    domain.isCreator = !!domain.isCreator;
    return domain;
  } catch (err) {
    db.release();
    throw err;
  }
}
