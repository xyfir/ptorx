export = function (mod): string {
    
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
            if (mod.value === undefined || mod.with === undefined || mod.regex === undefined)
                return "Missing find, replace, or regex values";
            break;
        case 4:
            if (mod.subject === undefined || mod.subject.substr(0, 1) == '{')
                return "Missing or bad subject value. Cannot start with '{' character";
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