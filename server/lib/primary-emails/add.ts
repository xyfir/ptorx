import { listPrimaryEmails } from 'lib/primary-emails/list';
import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { buildTemplate } from 'lib/mail/templates/build';
import { sendMail } from 'lib/mail/send';

import { getUser } from 'lib/users/get';
import * as moment from 'moment';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function addPrimaryEmail(
  primaryEmail: Partial<Ptorx.PrimaryEmail>,
  userId: number
): Promise<Ptorx.PrimaryEmail> {
  const db = new MySQL();
  try {
    const user = await getUser(userId);
    if (user.tier == 'basic') {
      const primaryEmails = await listPrimaryEmails(userId);
      if (primaryEmails.length > 0)
        throw 'Basic tier users can only have one primary email';
    }

    const insert: Partial<Ptorx.PrimaryEmail> = {
      userId,
      created: moment().unix(),
      address: primaryEmail.address,
      key: uuid()
    };
    const result = await db.query('INSERT INTO primary_emails SET ?', insert);
    if (!result.affectedRows) throw 'Could not add primary email';
    db.release();

    let _primaryEmail = await getPrimaryEmail(result.insertId, userId);
    _primaryEmail = await editPrimaryEmail(
      { ..._primaryEmail, ...primaryEmail },
      userId
    );

    const { html, text } = await buildTemplate('verify-email', {
      link: `${process.enve.API_URL}/primary-emails/verify?primaryEmailId=${
        _primaryEmail.id
      }&primaryEmailKey=${_primaryEmail.key}`
    });
    await sendMail(process.enve.DOMAIN_ID, {
      subject: `Verify your email for ${process.enve.NAME}`,
      from: `noreply-x@${process.enve.DOMAIN}`,
      html,
      text,
      to: _primaryEmail.address
    });

    return _primaryEmail;
  } catch (err) {
    db.release();
    throw err;
  }
}
