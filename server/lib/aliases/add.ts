import { listPrimaryEmails } from 'lib/primary-emails/list';
import { listDomains } from 'lib/domains/list';
import { checkAlias } from 'lib/aliases/check';
import { editAlias } from 'lib/aliases/edit';
import { getAlias } from 'lib/aliases/get';
import * as moment from 'moment';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';
import { rword } from 'rword';

export async function addAlias(
  alias: Partial<Ptorx.Alias>,
  userId: number
): Promise<Ptorx.Alias> {
  const db = new MySQL();
  try {
    // Validate that user is authorized to use domain
    const domains = await listDomains(userId);
    if (domains.findIndex(d => d.id == alias.domainId) == -1)
      throw 'You cannot use that domain';

    // Generate an available address
    if (!alias.address) {
      alias.address = rword.generateFromPool(1) as string;
      while (true) {
        alias.address += Date.now()
          .toString()
          .substr(-2);
        const { available } = await checkAlias(alias.domainId, alias.address);
        if (available) break;
      }
    }
    // Validate provided address
    else {
      alias.address = alias.address.toLowerCase();

      if (alias.address) {
        if (!/^[\w\-]{1,64}$/.test(alias.address))
          throw 'Bad address: must be 1-64 alphanumerical characters';
        if (alias.address.startsWith('x-'))
          throw 'Bad address: cannot start with "x-"';
        if (alias.address.endsWith('-x'))
          throw 'Bad address: cannot end with "-x"';
        if (alias.address.indexOf('--') > -1)
          throw 'Bad address: cannot contain 2+ consecutive hyphens';
        if (alias.address.indexOf('__') > -1)
          throw 'Bad address: cannot contain 2+ consecutive underscores';
        if (alias.address.startsWith('srs'))
          throw 'Bad address: cannot start with "srs"';
      }

      const { available } = await checkAlias(alias.domainId, alias.address);
      if (!available) throw 'Email is already in use';
    }

    // Create alias
    const insert: Partial<Ptorx.Alias> = {
      userId,
      created: moment().unix(),
      address: alias.address,
      domainId: alias.domainId
    };
    const result = await db.query('INSERT INTO aliases SET ?', insert);
    const _alias = await getAlias(result.insertId, userId);
    db.release();

    // Automatically link primary emails
    if (!alias.links || !alias.links.length) {
      const primaryEmails = await listPrimaryEmails(userId);
      _alias.links = primaryEmails
        .filter(primaryEmail => primaryEmail.autolink)
        .map(
          (primaryEmail, i): Ptorx.AliasLink => ({
            aliasId: _alias.id,
            orderIndex: i,
            primaryEmailId: primaryEmail.id
          })
        );
    }

    return await editAlias({ ..._alias, ...alias }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
