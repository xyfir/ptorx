import { addProxyEmail } from 'lib/proxy-emails/add';
import { addDomain } from 'lib/domains/add';
import * as storage from 'node-persist';
import { MySQL } from 'lib/MySQL';

/**
 * @todo After ran:
 * @todo Remove Ptorx.Env.Temporary from ptorx.d.ts
 * @todo Remove unused variables from .env
 * @todo Delete v5 database
 * @todo Uninstall node-persist and @types/node-persist
 */
export async function v5tov6() {
  const oldDB = new MySQL();
  const newDB = new MySQL();
  oldDB.cn.config.database = process.enve.OLD_DATABASE_NAME;
  try {
    await storage.init({ dir: process.enve.ACCOWNT_DB_DIRECTORY });

    // Convert users
    const users = await oldDB.query('SELECT * FROM users');
    for (let oldUser of users) {
      const accowntUser = {
        id: oldUser.user_id,
        email: oldUser.email,
        verified: true,
        failedLogins: 0,
        lastFailedLogin: 0
      };
      await storage.setItem(`user-${accowntUser.id}`, accowntUser);
      await storage.setItem(`email-${accowntUser.email}`, accowntUser.id);
      await newDB.query('INSERT INTO users SET ?', {
        userId: accowntUser.id,
        email: accowntUser.email,
        credits: 1500,
        tier: 'premium',
        tierExpiration: Date.now() + 60 * 60 * 24 * 365 * 1000
      });
    }

    // Convert primary emails
    const primaryEmails = await oldDB.query('SELECT * FROM primary_emails');
    for (let oldPrimaryEmail of primaryEmails) {
      await newDB.query('INSERT INTO primary_emails SET ?', {
        id: oldPrimaryEmail.email_id,
        userId: oldPrimaryEmail.user_id,
        address: oldPrimaryEmail.address,
        created: Date.now(),
        verified: true
      });
    }

    // Convert filters
    const filters = await oldDB.query('SELECT * FROM filters');
    for (let oldFilter of filters) {
      await newDB.query('INSERT INTO filters SET ?', {
        id: oldFilter.filter_id,
        userId: oldFilter.user_id,
        name: oldFilter.name,
        type:
          oldFilter.type == 1
            ? 'subject'
            : oldFilter.type == 2
            ? 'address'
            : oldFilter.type == 4
            ? 'text'
            : oldFilter.type == 5
            ? 'html'
            : oldFilter.type == 6
            ? 'header'
            : '',
        find: oldFilter.find,
        blacklist: !oldFilter.accept_on_match,
        regex: oldFilter.use_regex,
        created: Date.now()
      });
    }

    const domainMap: { [x: number]: number } = {};

    // Convert domains
    const domains = await oldDB.query('SELECT * FROM domains');
    for (let oldDomain of domains) {
      const newDomain = await addDomain(
        { domain: oldDomain.domain, global: false },
        oldDomain.user_id
      );
      domainMap[oldDomain.id] = newDomain.id;
    }

    // Convert domains
    const domainUsers = await oldDB.query('SELECT * FROM domain_users');
    for (let oldDomainUser of domainUsers) {
      await newDB.query('INSERT INTO domain_users SET ?', {
        userId: oldDomainUser.user_id,
        domainId: oldDomainUser.domain_id,
        label: oldDomainUser.label,
        request_key: oldDomainUser.requestKey,
        created: Date.now(),
        authorized: true
      });
    }

    // Convert proxy emails
    const proxyEmails = await oldDB.query('SELECT * FROM proxy_emails');
    const linkedFilters = await oldDB.query('SELECT * FROM linked_filters');
    for (let oldProxyEmail of proxyEmails) {
      const links = linkedFilters
        .filter(f => f.email_id == oldProxyEmail.email_id)
        .map((f, i) => ({ orderIndex: i, filterId: f.id }));
      links.push({
        orderIndex: links.length,
        primaryEmailId: oldProxyEmail.primary_email_id
      });
      addProxyEmail(
        {
          address: oldProxyEmail.address,
          domainId: domainMap[oldProxyEmail.domain_id],
          links,
          name: oldProxyEmail.name,
          saveMail: oldProxyEmail.save_mail,
          userId: oldProxyEmail.user_id
        },
        oldProxyEmail.user_id
      );
    }
  } catch (err) {
    console.error('jobs/v5-to-v6', err);
  }
  oldDB.release();
  newDB.release();
}
