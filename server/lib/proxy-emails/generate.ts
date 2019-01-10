import { MySQL } from 'lib/MySQL';
import { rword } from 'rword';

/**
 * Generates an available proxy email address.
 */
export async function generateProxyAddress(
  db: MySQL,
  domain: number
): Promise<string> {
  const sql = `
    SELECT email_id FROM proxy_emails WHERE address = ? AND domain_id = ?
  `;
  let email = rword.generateFromPool(1) as string;

  while (true) {
    email += Date.now()
      .toString()
      .substr(-2);
    const rows = await db.query(sql, [email, domain]);
    if (!rows.length) return email;
  }
}
