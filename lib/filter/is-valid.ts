export = function (filter): boolean {
    
    if (!filter.type)
        return false;

    else if (!(filter.name || "").match(/^[\w\d -]{1,40}$/))
        return false;

    else if (!filter.find)
        return false;

    else if ((filter.description || "").length > 150)
        return false;

    else if ((filter.find || "").length > 250)
        return false;

    else if (filter.type == 6 && filter.find.indexOf(":::") === -1)
        return false;

    else return true;

};