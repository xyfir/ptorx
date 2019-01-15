import { editMessage } from 'lib/messages/edit';
import { getMessage } from 'lib/messages/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function addMessage(
  message: Ptorx.Message,
  userId: number
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const id = uuid();
    const result = await db.query('INSERT INTO messages SET ?', {
      id,
      userId,
      created: moment().unix()
    });
    if (!result.affectedRows) throw 'Could not create message';
    const _message = await getMessage(id, userId);
    return await editMessage({ ..._message, ...message }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
