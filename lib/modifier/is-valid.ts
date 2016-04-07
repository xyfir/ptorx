export = function (mod): boolean {
    
    if (!mod.type)
        return false;

    if (!(mod.name || "").match(/^[\w\d -]{1,40}$/))
        return false;

    if ((mod.description || "").length > 150)
        return false;

    switch (+mod.type) {
        case 1:
            return mod.key !== undefined && mod.key.substr(0, 1) != '{';
        case 2:
            return true;
        case 3:
            return mod.value !== undefined && mod.with !== undefined && mod.regex;
        case 4:
            return mod.subject !== undefined && mod.subject.substr(0, 1) != '{';
        case 5:
            return mod.prepend !== undefined && mod.value !== undefined;
        default:
            return false;
    }
    
};