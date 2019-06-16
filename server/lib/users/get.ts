import { addPrimaryEmail } from 'lib/primary-emails/add';
import { TIERS } from 'lib/users/tiers';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getUser(
  user: Ptorx.JWT | null | number
): Promise<Ptorx.User> {
  const db = new MySQL();
  try {
    if (user === null) throw 'Not logged in';

    let [row] = await db.query('SELECT * FROM users WHERE userId = ?', [
      typeof user == 'number' ? user : user.userId
    ]);

    // We need to add the user to our database first
    if (!row && typeof user != 'number') {
      const insert: Ptorx.User = {
        tierExpiration: null,
        privateKey: null,
        publicKey: null,
        userId: user.userId,
        email: user.email,
        credits: TIERS[0].credits,
        tier: TIERS[0].name
      };
      await db.query('INSERT INTO users SET ?', insert);
      [row] = await db.query('SELECT * FROM users WHERE userId = ?', [
        user.userId
      ]);

      // Add their account email as an autolinking verified primary email
      await addPrimaryEmail(
        { address: user.email, autolink: true },
        user.userId,
        true
      );
    }

    db.release();
    return row;
  } catch (err) {
    db.release();
    throw err;
  }
}
