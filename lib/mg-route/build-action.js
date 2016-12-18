module.exports = function(id, save) {

    const url = "https://ptorx.com/api/receive/" + id;

    if (save)
        return `store(notify="${url}")`;
    else
        return `forward("${url}")`

};