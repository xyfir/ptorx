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

            // Ensure free members are only using allowed filters/options
            for (let row of rows) {
                if (types.indexOf(row.type) > -1 && row.type != 6) {
                    fn(true, "Cannot have multiple non-header filters");
                    return;
                }
                
                if (Date.now() > req.session.subscription) {
                    if (row.type != 1) {
                        fn(true, "Free members can only use subject filters"); return;
                    }
                    else if (row.accept_on_match != 1) {
                        fn(true, "Free members cannot use 'reject on match' filters"); return;
                    }
                    else if (row.use_regex == 1) {
                        fn(true, "Free members cannot use Regular Expressions in filters"); return;
                    }
                }

                types.push(row.type);
            }
            fn(false);
        }
    });

};