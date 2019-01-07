const escapeRegExp = require('escape-string-regexp');

/**
 * Build the `match expression` field for the proxy email's Mailgun route.
 * @async
 * @param {object} db
 * @param {object} data
 * @return {string}
 */
export async function buildMailgunRouteExpression(db, data) {
  let expression = `match_recipient("^${data.address}$")`;

  if (!data.filters.length || data.saveMail) return expression;

  // Only accept_on_match filters are ran on MailGun
  const sql = `
    SELECT
      type, find, use_regex AS regex
    FROM filters WHERE
      filter_id IN (?) AND accept_on_match = 1
      AND type IN (1, 2, 3, 6)
  `,
    rows = await db.query(sql, [data.filters]);

  expression += rows
    .map(row => {
      // Escape regex if filter is not using regex
      if (!row.regex && row.type != 6) row.find = escapeRegExp(row.find);

      switch (row.type) {
        case 1:
          return ` and match_header("subject", "${row.find}")`;
        case 2:
          return ` and match_header("from", "${row.find}")`;
        case 3:
          return ` and match_header("from", "(.*)@${row.find}")`;
        case 6:
          row.find = row.find.split(':::');

          return (
            ` and match_header("${row.find[0]}", "` +
            (!row.regex ? escapeRegExp(row.find[1]) : row.find[1]) +
            '")'
          );
      }
    })
    .join('');

  return expression;
}
