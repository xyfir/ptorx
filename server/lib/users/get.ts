import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function getUser(jwt: Ptorx.JWT | null): Promise<Ptorx.User> {
  const db = new MySQL();
  try {
    if (jwt === null) throw 'Not logged in';
    let [row] = await db.query('SELECT * FROM users WHERE userId = ?', [
      jwt.userId
    ]);

    // We need to add the user to our database first
    if (!row) {
      const insert: Ptorx.User = {
        userId: jwt.userId,
        email: jwt.email,
        credits: 100,
        emailTemplate: null
      };
      await db.query('INSERT INTO users SET ?', insert);
      [row] = await db.query('SELECT * FROM users WHERE userId = ?', [
        jwt.userId
      ]);
    }

    db.release();
    return row;
  } catch (err) {
    db.release();
    throw err;
  }
}
