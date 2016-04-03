export = function (filter): boolean {

    if (!filter.type || !(filter.name || "").match(/^\w{1,40}$/) || (filter || "").description.length > 150 || !filter.find)
        return false;

    else if ((filter.find || "").length > 150)
        return false;

    else if (filter.type == 6 && filter.find.indexOf(":::") === -1)
        return false;

    else return true;

};