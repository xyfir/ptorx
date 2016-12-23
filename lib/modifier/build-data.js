module.exports = function(mod) {
    
    switch (+mod.type) {
        case 1:
            return mod.key + '';
        case 2:
            return "";
        case 3:
            return JSON.stringify({
                regex: !!+mod.regex,
                flags: mod.flags,
                value: mod.value,
                with: mod.with
            });
        case 4:
            return mod.subject + '';
        case 5:
            return JSON.stringify({ prepend: !!(+mod.prepend), value: mod.value });
    }

};