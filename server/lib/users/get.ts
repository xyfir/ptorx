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
        userId: user.userId,
        email: user.email,
        credits: 100,
        tier: 'basic'
      };
      await db.query('INSERT INTO users SET ?', insert);
      [row] = await db.query('SELECT * FROM users WHERE userId = ?', [
        user.userId
      ]);
    }

    db.release();
    return row;
  } catch (err) {
    db.release();
    throw err;
  }
}
