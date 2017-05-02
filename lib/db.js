const mysql = require("mysql");

// Set global["__mysql"] equal to a client pool
if (global["__mysql"] === undefined) {
    let config = require("config").database.mysql;
    global["__mysql"] = mysql.createPool(config);
}

module.exports = function(callback) {

    global["__mysql"].getConnection((err, cn) => {
        callback(cn);
    });

};