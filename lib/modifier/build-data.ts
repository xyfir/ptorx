export = function (mod): string {
    
    switch (mod.type) {
        case 1:
            return mod.key + '';
        case 2:
            return "";
        case 3:
            return JSON.stringify({ value: mod.value, with: mod.with, regex: !!mod.regex });
        case 4:
            return mod.subject + '';
        case 5:
            return JSON.stringify({ prepend: mod.prepend, value: mod.value });
    }

};