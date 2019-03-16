import { editUser } from 'lib/users/edit';
import { getUser } from 'lib/users/get';
import { Ptorx } from 'types/ptorx';

export async function setPGPKeys(
  privateKey: Ptorx.User['privateKey'],
  publicKey: Ptorx.User['publicKey'],
  userId: Ptorx.User['userId']
): Promise<Ptorx.User> {
  const user = await getUser(userId);
  user.privateKey = privateKey;
  user.publicKey = publicKey;
  return await editUser(user);
}
