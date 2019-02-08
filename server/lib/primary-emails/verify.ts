import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { Ptorx } from 'types/ptorx';

export async function verifyPrimaryEmail(
  primaryEmailId: Ptorx.PrimaryEmail['id'],
  primaryEmailKey: Ptorx.PrimaryEmail['key'],
  userId: number
): Promise<void> {
  try {
    const primaryEmail = await getPrimaryEmail(primaryEmailId, userId);
    if (primaryEmail.key != primaryEmailKey)
      throw 'Primary email could not be verified';
    await editPrimaryEmail({ ...primaryEmail, verified: true }, userId);
  } catch (err) {
    throw err;
  }
}
