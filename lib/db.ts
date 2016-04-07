import * as mysql from "mysql";

// Set global["__mysql"] equal to a client pool
if (global["__mysql"] === undefined) {
    let config = require("../config").database.mysql;
    global["__mysql"] = mysql.createPool(config);
}

export = (callback: Function) => {

    global["__mysql"].getConnection((err, cn: mysql.IConnection) => {
        callback(cn);
    });

};