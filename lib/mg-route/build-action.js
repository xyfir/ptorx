module.exports = function(id, subscription, save) {

    let action = "https://ptorx.com/api/receive/"
        + (Date.now() > subscription ? "free" : "paid")
        + "/" + id;

    if (save)
        action = `store(notify="${action}")`;
    else
        action = `forward("${action}")`

    return action;

};