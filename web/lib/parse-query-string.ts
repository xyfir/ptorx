/**
 * Parses the provided query string into an object.
 */
export function parseQuery(qs: string): any {
  const query = {};
  qs = qs.split('?')[1];

  if (qs == undefined) return query;

  qs.split('&').forEach(q => {
    const [key, value] = q.split('=');
    query[key] = value === undefined ? '' : decodeURIComponent(value);
  });

  return query;
}
