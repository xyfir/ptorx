module.exports = function(filters, req, cn, fn) {

    // User has no filters
    if (filters[0] + '' === '') {
        fn(false);
        return;
    }

    // Validate that all filters exist and user has access to them
    let sql = `
        SELECT type, accept_on_match, use_regex FROM filters
        WHERE filter_id IN (?) AND user_id = ?
    `;
    cn.query(sql, [filters, req.session.uid], (err, rows) => {
        if (rows.length !== filters.length) {
            fn(true, "One or more filters provided do not exist");
        }
        else {
            let types = [];

            // Validate filter types and count            
            for (let row of rows) {
                if (types.indexOf(row.type) > -1 && row.type != 6) {
                    fn(true, "Cannot have multiple non-header filters");
                    return;
                }

                types.push(row.type);
            }
            
            fn(false);
        }
    });

};