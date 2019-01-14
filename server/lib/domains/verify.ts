import { editDomain } from 'lib/domains/edit';
import { getDomain } from 'lib/domains/get';
import { Ptorx } from 'typings/ptorx';

/**
 * @todo Actually verify domain
 */
export async function verifyDomain(
  domainId: Ptorx.Domain['id'],
  userId: number
): Promise<void> {
  try {
    const domain = await getDomain(domainId, userId);
    await editDomain({ ...domain, verified: true }, userId);
  } catch (err) {
    throw err;
  }
}
