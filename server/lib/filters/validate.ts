export function validateFilter(filter) {
  if (!filter.type) return 'Invalid type';
  else if (!(filter.name || '').match(/^[\w\d -]{1,40}$/))
    return 'Invalid name characters or length';
  else if (!filter.find || (filter.find + '').length > 250)
    return 'Missing find query or invalid length. Limit 250 characters';
  else if (filter.type == 6 && filter.find.indexOf(':::') === -1)
    return 'Bad header filter';
  else return 'ok';
}
