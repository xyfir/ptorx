import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function addPrimaryEmail(
  primaryEmail: Partial<Ptorx.PrimaryEmail>,
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const insert: Partial<Ptorx.PrimaryEmail> = {
      userId,
      created: moment().unix(),
      address: primaryEmail.address,
      key: uuid()
    };
    const result = await db.query('INSERT INTO primary_emails SET ?', insert);
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
