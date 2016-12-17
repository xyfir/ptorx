const db = require("db");

module.exports = function() {
    
    const sql = `
        DELETE FROM messages WHERE received + 255600 < UNIX_TIMESTAMP()
    `;

    db(cn => cn.query(sql, () => cn.release()));

}