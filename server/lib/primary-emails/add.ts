import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';

export async function addPrimaryEmail(
  primaryEmail: Partial<Ptorx.PrimaryEmail>,
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const result = await db.query('INSERT INTO primary_emails SET ?', {
      userId,
      created: moment().unix()
    });
    if (!result.affectedRows) throw 'Could not add primary email';
    db.release();
    const _primaryEmail = await getPrimaryEmail(result.insertId, userId);
    return await editPrimaryEmail(
      { ..._primaryEmail, ...primaryEmail },
      userId
    );
  } catch (err) {
    db.release();
    throw err;
  }
}
