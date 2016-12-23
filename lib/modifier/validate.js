module.exports = function(mod) {
    
    if (!mod.type)
        return "Invalid type";

    if (!(mod.name || "").match(/^[\w\d -]{1,40}$/))
        return "Invalid name characters or length";

    if ((mod.description || "").length > 150)
        return "Invalid description length";

    switch (+mod.type) {
        case 1:
            if (mod.key === undefined || mod.key.substr(0, 1) == '{')
                return "Missing or bad encryption key. Cannot start with '{' character";
            break;
        case 2:
            return "ok";
        case 3:
            if (
                mod.value === undefined
                || mod.with === undefined
                || mod.regex === undefined
                || mod.flags === undefined
            )
                return "Missing find, replace, use regex, or regex flag values";
            else if (!/^[gimu]{0,4}$/.test(mod.flags))
                return "Invalid regular expression flags"
            break;
        case 4:
            if (mod.subject === undefined)
                return "Missing or bad subject value";
            else if (mod.subject.substr(0, 1) == '{')
                return "Cannot start subject with '{' character";
            break;
        case 5:
            if (mod.prepend === undefined || mod.value === undefined)
                return "Missing tag or prepend value";
            break;
        default:
            return "Invalid type";
    }

    return "ok";
    
};