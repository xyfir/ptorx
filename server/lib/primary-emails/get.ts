import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const [primaryEmail]: Ptorx.PrimaryEmail[] = await db.query(
      'SELECT * FROM primary_emails WHERE id = ? AND userId = ?',
      [primaryEmailId, userId]
    );
    if (!primaryEmail) throw 'Could not find primary email';
    db.release();

    primaryEmail.verified = !!primaryEmail.verified;
    primaryEmail.autolink = !!primaryEmail.autolink;

    return primaryEmail;
  } catch (err) {
    db.release();
    throw err;
  }
}
