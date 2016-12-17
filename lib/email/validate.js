module.exports = function(email, subscription) {

    if (!(email.name || '').match(/^[\w\s-.@_]{1,40}$/))
        return "Invalid name";
    if ((email.description || '').length > 150)
        return "Description character limit hit";

    if (Date.now() > subscription) {
        if ((email.address || '').length > 0)
            return "Free members cannot customize email address";
        if ((email.filters || '').indexOf(',') > -1)
            return "Free members can only have a subject filter";
        if ((email.modifiers || '').length > 0)
            return "Free members cannot use modifiers";
        if (!email.to || !!(+email.noToAddress))
            return "Free member emails must redirect to a main address";
        if (!!(+email.saveMail))
            return "Free members cannot save emails";
    }
    else {
        if (email.address && !email.address.match(/^[A-Za-z0-9]{1,35}@ptorx.com$/))
            return "Invalid email address characters or length";
    }

    return "ok";

};