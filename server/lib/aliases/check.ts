import { MySQL } from 'lib/MySQL';
import { Ptorx } from 'types/ptorx';

export async function checkAlias(
  domainId: Ptorx.Alias['domainId'],
  address: Ptorx.Alias['address']
): Promise<{ available: boolean }> {
  const db = new MySQL();
  try {
    const rows: { inTable: number }[] = await db.query(
      `
        SELECT COUNT(id) AS inTable FROM aliases
        WHERE address = ? AND domainId = ?
        UNION
        SELECT COUNT(domainId) AS inTable FROM deleted_aliases
        WHERE address = ? AND domainId = ?
      `,
      [address, domainId, address, domainId]
    );
    db.release();
    return { available: rows.findIndex(r => !!r.inTable) == -1 };
  } catch (err) {
    db.release();
    throw err;
  }
}
