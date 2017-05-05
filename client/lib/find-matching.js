/**
 * Finds matching modifiers or filters.
 * @param {object[]} items - An array of objects that must contain `name` and 
 * `description` string properties.
 * @param {object} search - An object containing `type` and `query` properties.
 * @param {object[]} [ignore] - Same as items. Items in `items` that match 
 * `search` but are present in `ignore` are not returned. 
 * @returns {object[]}
 */
export default function (items, search, ignore = []) {
  
  search.query = search.query.toLowerCase();
  
  return items.filter(item => {
    // Is ignored
    if (!!ignore.find(i => i.id == item.id))
      return false;
    // Type doesn't match and user is requesting specific type
    else if (item.type != search.type && search.type != 0 )
      return false;
    // Name matches search
    else if (item.name.toLowerCase().indexOf(search.query) > -1)
      return true;
    // Description matches search
    else if (item.description.toLowerCase().indexOf(search.query) > -1)
      return true;
    // Email address property exists and matches search
    else if (item.address && item.address.indexOf(search.query) > -1)
      return true;
  });
  
}