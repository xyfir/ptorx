module.exports = function(modifiers, req, cn, fn) {

    // User has no modifiers
    if (modifiers[0] + '' === '') {
        fn(false);
        return;
    }

    // Validate that all filters exist and user has access to them
    let sql = `
        SELECT type FROM modifiers WHERE modifier_id IN (?) AND user_id = ?
    `;
    cn.query(sql, [modifiers.join(", "), req.session.uid], (err, rows) => {
        if (rows.length !== modifiers.length) {
            fn(true, "One or more modifiers provided do not exist");
        }
        else {
            // Ensure no more than one encryption modifier is present
            let encrypt = false;
            for (let row in rows) {
                if (row.type == 1 && encrypt) {
                    fn(true, "Cannot use more than one encryption modifier");
                    return;
                }
                else if (row.type == 1) {
                    encrypt = true;
                }
            }

            fn(false);
        }
    });

};