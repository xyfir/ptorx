import { getPrimaryEmail } from 'lib/primary-emails/get';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editPrimaryEmail(
  primaryEmail: Ptorx.PrimaryEmail,
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    await db.query(
      `
        UPDATE primary_emails SET address = ?
        WHERE id = ? AND userId = ?
      `,
      [primaryEmail.address, primaryEmail.id, userId]
    );
    db.release();
    return await getPrimaryEmail(primaryEmail.id, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
