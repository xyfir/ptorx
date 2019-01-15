import { MySQL } from 'lib/MySQL';

/**
 * Charges a user's account credits and fails if not enough are available
 * @return The user's remaining credits after charge
 */
export async function chargeUser(
  userId: number,
  amount: number
): Promise<number> {
  const db = new MySQL();
  try {
    let [{ credits }]: { credits: number }[] = await db.query(
      'SELECT credits FROM users WHERE userId = ?',
      [userId]
    );
    if (amount > credits) throw `No credits (need ${amount}; have ${credits})`;

    credits -= amount;
    await db.query('UPDATE users SET credits = ? WHERE userId = ?', [
      credits,
      userId
    ]);

    db.release();
    return credits;
  } catch (err) {
    db.release();
    throw err;
  }
}
