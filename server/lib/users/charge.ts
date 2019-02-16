import { editUser } from 'lib/users/edit';
import { Ptorx } from 'types/ptorx';

/**
 * Charge user's credits. Does not check balance or fail on insufficient funds.
 */
export function chargeCredits(
  user: Ptorx.User,
  amount: number
): Promise<Ptorx.User> {
  user.credits = amount > user.credits ? 0 : user.credits - amount;
  return editUser(user);
}
