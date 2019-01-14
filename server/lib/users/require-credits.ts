import { MySQL } from 'lib/MySQL';

/**
 * Charges a user's account credits. If not enough credits are available it
 *  fails. If all credits are used by the action then the user's emails are
 *  deactivated but the action will not fail.
 */
export async function requireCredits(userId: number): Promise<number> {
  const db = new MySQL();
  try {
    const [row] = await db.query('SELECT credits FROM users WHERE userId = ?', [
      userId
    ]);
    if (!row) throw 'Could not find user';

    const credits = +row.credits;
    if (!credits) throw 'This action requires your account to have credits';

    db.release();
    return credits;
  } catch (err) {
    db.release();
    throw err;
  }
}
