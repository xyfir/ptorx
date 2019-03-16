import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function editUser(user: Ptorx.User): Promise<Ptorx.User> {
  const db = new MySQL();
  try {
    const result = await db.query(
      `
        UPDATE users SET
          credits = ?, tier = ?, tierExpiration = ?, publicKey = ?,
          privateKey = ?
        WHERE userId = ?
      `,
      [
        user.credits,
        user.tier,
        user.tierExpiration,
        user.publicKey,
        user.privateKey,
        user.userId
      ]
    );
    if (!result.affectedRows) throw 'Could not edit user';
    db.release();
    return await getUser(user.userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
