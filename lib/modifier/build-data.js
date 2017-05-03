/**
 * Builds the value for the `data` column in the `modifiers` table.
 * @param {object} mod
 * @returns {string} A normal or JSON string.
 */
module.exports = function(mod) {
  
  switch (+mod.type) {
    case 1:
      return String(mod.key);

    case 2:
      return '';

    case 3:
      return (() => {
        const regex = !!+mod.regex;

        return JSON.stringify({
          regex, value: mod.value, with: mod.with,
          flags: (regex ? mod.flags : 'g')
        });
      })();

    case 4:
      return String(mod.subject);

    case 5:
      return JSON.stringify({ prepend: !!(+mod.prepend), value: mod.value });

    case 6:
      return JSON.stringify({
        add: mod.add, to: mod.to, separator: mod.separator
      });
  }

};