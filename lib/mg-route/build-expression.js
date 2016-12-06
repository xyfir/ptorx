module.exports = function(data, cn, fn) {

    let expression = `match_recipient('${data.address}')`;

    if ((data.filters[0] + '' === '') || data.saveMail) {
        fn(expression);
        return;
    }

    // Only accept_on_match filters are ran on MailGun
    let sql = `
        SELECT type, find FROM filters WHERE filter_id IN (?)
        AND accept_on_match = 1 AND type IN (1, 2, 3, 6)
    `;
    cn.query(sql, [data.filters], (err, rows) => {
        for (let row of rows) {
            switch (row.type) {
                case 1:
                    expression += ` and match_header('subject', '${row.find}')`;
                    break;
                case 2:
                    expression += ` and match_header('from', '${row.find}')`;
                    break;
                case 3:
                    expression += ` and match_header('from', '(.*)@${row.find}')`;
                    break;
                case 6:
                    expression += ` and match_header('${row.find.split(":::")[0]}',`
                        + ` '${row.find.split(":::")[1]}')`;
            }
        }

        fn(expression);
    });

};