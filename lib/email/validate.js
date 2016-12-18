module.exports = function(email, subscription) {
    
    if (Date.now() > subscription)
        return "You do not have a subscription";    

    if (!(email.name || '').match(/^[\w\s-.@_]{1,40}$/))
        return "Invalid name";
    if ((email.description || '').length > 150)
        return "Description character limit hit";
    if (email.address && !email.address.match(/^[A-Za-z0-9]{1,35}@ptorx.com$/))
        return "Invalid email address characters or length";

    return "ok";

};