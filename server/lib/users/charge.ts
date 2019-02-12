import { MySQL } from 'lib/MySQL';

/**
 * Charges a user's account credits. Never fails or checks their balance.
 */
export async function chargeUser(
  userId: number,
  amount: number
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query('UPDATE users SET credits = credits - ? WHERE userId = ?', [
      amount,
      userId
    ]);
  } catch (err) {
    if (err.message.startsWith('ER_DATA_OUT_OF_RANGE:'))
      await db.query('UPDATE users SET credits = 0 WHERE userId = ?', [userId]);
  }
  db.release();
}
