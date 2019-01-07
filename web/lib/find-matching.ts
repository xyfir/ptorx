import Fuse from 'fuse.js';

/**
 * Finds matching modifiers or filters.
 * @param {object[]} items - An array of objects that must contain `name` and
 * `description` string properties.
 * @param {object} search - An object containing `type` and `query` properties.
 * @param {object[]} [ignore] - Same as items. Items in `items` that match
 * `search` but are present in `ignore` are not returned.
 * @returns {object[]}
 */
export default function(items, search, ignore = []) {
  items = items.filter(item => {
    // Is ignored
    if (ignore.findIndex(i => i.id == item.id) > -1) return false;
    // Type doesn't match and user is requesting specific type
    if (search.type && item.type != search.type) return false;

    return true;
  });

  if (search.query) {
    const options = {
      shouldSort: true,
      threshold: 0.4,
      keys: []
    };

    if (items[0]) {
      if (items[0].address) options.keys.push({ name: 'address', weight: 0.7 });
      if (items[0].domain) options.keys.push({ name: 'domain', weight: 0.7 });
      if (items[0].name) options.keys.push({ name: 'name', weight: 0.5 });
      if (items[0].description)
        options.keys.push({ name: 'description', weight: 0.2 });
    }

    const fuse = new Fuse(items, options);

    items = fuse.search(search.query.toLowerCase());
  }

  return items;
}
