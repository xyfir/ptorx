import buildData = require("../../lib/modifier/build-data");
import isValid = require("../../lib/modifier/is-valid");
import db = require("../../lib/db");

/*
    POST api/modifiers
    REQUIRED
        type: number, name: string, description: string
    OPTIONAL
        ENCRYPT
            key: string
        REPLACE
            value: string, with: string, regex: boolean
        TAG
            prepend: string, value: string
        SUBJECT
            subject: string
    RETURN
        { error: boolean, message?: string, id?: number }
    DESCRIPTION
        Create a new modifier
*/
export = function (req, res) {

    if (!isValid(req.body)) {
        res.json({ error: true, message: "Bad or missing modifier data" });
        return;
    }

    let insert = {
        data: buildData(req.body), user_id: req.session.uid, name: req.body.name,
        description: req.body.description, type: req.body.type
    };

    let sql: string = `INSERT INTO modifiers SET ?`;
    db(cn => cn.query(sql, insert, (err, result) => {
        cn.release();
        
        if (err || !result.affectedRows)
            res.json({ error: true, message: "An unknown error occured" });
        else
            res.json({ error: false, id: result.insertId });
    }));

};