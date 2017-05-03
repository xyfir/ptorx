/**
 * Validates a modifier provided by the user. Throws error if invalid.
 * @param {object} mod
 */
module.exports = function(mod) {
  
  if (!mod.type)
    throw 'Invalid type';

  if (!(mod.name || '').match(/^[\w\d -]{1,40}$/))
    throw 'Invalid name characters or length';

  if ((mod.description || '').length > 150)
    throw 'Invalid description length';

  switch (+mod.type) {
    case 1:
      if (mod.key === undefined || mod.key.substr(0, 1) == '{')
        throw 'Missing or bad encryption key. Cannot start with "{" character';
      break;

    case 2:
      break;

    case 3:
      if (
        mod.value === undefined || mod.with === undefined ||
        mod.regex === undefined || mod.flags === undefined
      )
        throw 'Missing find, replace, use regex, or regex flag values';
      else if (!/^[gimu]{0,4}$/.test(mod.flags))
        throw 'Invalid regular expression flags'
      break;

    case 4:
      if (mod.subject === undefined)
        throw 'Missing or bad subject value';
      else if (mod.subject.substr(0, 1) == '{')
        throw 'Cannot start subject with "{" character';
      break;

    case 5:
      if (mod.prepend === undefined || mod.value === undefined)
        throw 'Missing tag or prepend value';
      break;

    case 6:
      if (mod.add === undefined || mod.to === undefined)
        throw 'Missing "add" or "to" values';
      break;

    default:
      throw 'Invalid type';
  }
  
};