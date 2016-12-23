const escapeRegExp = require("escape-string-regexp");

module.exports = function(data, cn, fn) {

    if ((data.filters[0] + '' === '') || data.saveMail) {
        fn(expression);
        return;
    }

    // Only accept_on_match filters are ran on MailGun
    const sql = `
        SELECT
            type, find, use_regex AS regex
        FROM filters WHERE
            filter_id IN (?) AND accept_on_match = 1
            AND type IN (1, 2, 3, 6)
    `;
    cn.query(sql, [data.filters], (err, rows) => {
        const expression
        = `match_recipient('${data.address}')`
        + rows.map(row => {
            // Escape regex if filter is not using regex
            if (!row.regex && row.type != 6)
                row.find = escapeRegExp(row.find);

            switch (row.type) {
                case 1:
                    return ` and match_header('subject', '${row.find}')`;
                case 2:
                    return ` and match_header('from', '${row.find}')`;
                case 3:
                    return ` and match_header('from', '(.*)@${row.find}')`;
                case 6:
                    row.find = row.find.split(":::");

                    return ` and match_header('${
                        row.find[0]
                    }', '${
                        !row.regex ? escapeRegExp(row.find[1]) : row.find[1]
                    }')`;
            }
        }).join("");

        fn(expression);
    });

};