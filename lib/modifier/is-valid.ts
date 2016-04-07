export = function (mod): boolean {

    if (!mod.type || !(mod.name || "").match(/^\w{1,40}$/) || (mod || "").description.length > 150)
        return false;

    switch (mod.type) {
        case 1:
            return mod.key !== undefined && mod.key.substr(0, 1) != '{';
        case 2:
            return true;
        case 3:
            return mod.value !== undefined && mod.with !== undefined && [0, 1].indexOf(mod.regex) > -1;
        case 4:
            return mod.subject !== undefined && mod.subject.substr(0, 1) != '{';
        case 5:
            return [0, 1].indexOf(mod.prepend) > -1 && mod.value !== undefined;
        default:
            return false;
    }
    
};