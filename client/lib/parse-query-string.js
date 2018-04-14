/**
 * Parses the provided query string into an object.
 * @param {string} qs
 * @return {object}
 */
export default function(qs) {
  const query = {};
  qs = qs.split('?')[1];

  if (qs == undefined) return query;

  qs.split('&').forEach(q => {
    const [key, value] = q.split('=');

    query[key] = value === undefined ? '' : decodeURIComponent(value);
  });

  return query;
}
