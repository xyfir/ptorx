import { getPrimaryEmail } from 'lib/primary-emails/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function verifyPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  primaryEmailKey: Ptorx.PrimaryEmail['key'],
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    // Verify id/key/user
    const primaryEmail = await getPrimaryEmail(primaryEmailId, userId);
    if (primaryEmail.key != primaryEmailKey)
      throw 'Primary email could not be verified';

    // Mark as verified
    await db.query('UPDATE primary_emails SET verified = 1 WHERE id = ?', [
      primaryEmail.id
    ]);
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
