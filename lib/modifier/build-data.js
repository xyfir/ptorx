module.exports = function(mod) {
    
    switch (+mod.type) {
        case 1:
            return mod.key + '';
        case 2:
            return "";
        case 3:
            const regex = !!+mod.regex;

            return JSON.stringify({
                regex, value: mod.value, with: mod.with,
                flags: (regex ? mod.flags : "g")
            });
        case 4:
            return mod.subject + '';
        case 5:
            return JSON.stringify({ prepend: !!(+mod.prepend), value: mod.value });
    }

};