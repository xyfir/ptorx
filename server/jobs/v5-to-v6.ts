import { addProxyEmail } from 'lib/proxy-emails/add';
import { addDomain } from 'lib/domains/add';
import * as storage from 'node-persist';
import * as moment from 'moment';
import * as mysql from 'mysql';
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
  try {
    // @ts-ignore
    oldDB.cn = mysql.createConnection({
      ...process.enve.MYSQL,
      database: process.enve.OLD_DATABASE_NAME
    });

    await storage.init({ dir: process.enve.ACCOWNT_DB_DIRECTORY });

    // Convert users
    const users = await oldDB.query('SELECT * FROM users');
    console.log(`Found ${users.length} users`);
    for (let oldUser of users) {
      console.log(`Converting user ${oldUser.user_id}`);
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
        tierExpiration: moment()
          .add(1, 'year')
          .unix()
      });
    }

    // Convert primary emails
    const primaryEmails = await oldDB.query('SELECT * FROM primary_emails');
    console.log(`Found ${primaryEmails.length} primary emails`);
    for (let oldPrimaryEmail of primaryEmails) {
      console.log(`Converting primary email ${oldPrimaryEmail.email_id}`);
      if (!oldPrimaryEmail.user_id) continue;
      await newDB.query('INSERT INTO primary_emails SET ?', {
        id: oldPrimaryEmail.email_id,
        userId: oldPrimaryEmail.user_id,
        address: oldPrimaryEmail.address,
        created: moment().unix(),
        verified: true
      });
    }

    // Convert filters
    const filters = await oldDB.query('SELECT * FROM filters');
    console.log(`Found ${filters.length} filters`);
    for (let oldFilter of filters) {
      console.log(`Converting filter ${oldFilter.filter_id}`);
      if (!oldFilter.user_id) continue;
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
        created: moment().unix()
      });
    }

    const domainMap: { [x: number]: number } = {};

    // Convert domains
    const domains = await oldDB.query('SELECT * FROM domains');
    console.log(`Found ${domains.length} domains`);
    for (let oldDomain of domains) {
      console.log(`Converting domain ${oldDomain.id}`);
      if (!oldDomain.user_id) continue;
      const newDomain = await addDomain(
        { domain: oldDomain.domain, global: oldDomain.global },
        oldDomain.user_id
      );
      domainMap[oldDomain.id] = newDomain.id;
    }

    // Convert domain users
    const domainUsers = await oldDB.query('SELECT * FROM domain_users');
    console.log(`Found ${domainUsers.length} domain users`);
    for (let oldDomainUser of domainUsers) {
      console.log(
        `Converting domain user ${oldDomainUser.user_id}-${
          oldDomainUser.domain_id
        }`
      );
      if (!oldDomainUser.user_id) continue;
      try {
        await newDB.query('INSERT INTO domain_users SET ?', {
          userId: oldDomainUser.user_id,
          domainId: domainMap[oldDomainUser.domain_id],
          label: oldDomainUser.label,
          requestKey: oldDomainUser.request_key,
          created: moment().unix(),
          authorized: true
        });
      } catch (err) {
        if (!err.message.startsWith('ER_DUP_ENTRY:')) throw err;
      }
    }

    // Convert proxy emails
    const proxyEmails = await oldDB.query('SELECT * FROM proxy_emails');
    const linkedFilters = await oldDB.query('SELECT * FROM linked_filters');
    console.log(`Found ${proxyEmails.length} proxy emails`);
    console.log(`Found ${linkedFilters.length} linked filters`);
    for (let oldProxyEmail of proxyEmails) {
      // Convert deleted proxy emails
      if (!oldProxyEmail.user_id) {
        console.log(
          `Converting deleted proxy email ${oldProxyEmail.address}-${
            oldProxyEmail.domain_id
          }`
        );
        await newDB.query('INSERT INTO deleted_proxy_emails SET ?', {
          domainId: domainMap[oldProxyEmail.domain_id],
          address: oldProxyEmail.address
        });
        continue;
      }

      console.log(
        `Converting proxy email ${oldProxyEmail.address}-${
          oldProxyEmail.domain_id
        }`
      );
      const links = linkedFilters
        .filter(f => f.email_id == oldProxyEmail.email_id)
        .map((f, i) => ({ orderIndex: i, filterId: f.id }));
      links.push({
        orderIndex: links.length,
        primaryEmailId: oldProxyEmail.primary_email_id
      });
      await addProxyEmail(
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

    console.log('Done');
  } catch (err) {
    console.error('jobs/v5-to-v6', err);
  }
  newDB.release();
}
