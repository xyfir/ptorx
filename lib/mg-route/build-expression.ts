export = function (address: string, filters: number[], cn: any, fn: Function) {

    let expression: string = `match_recipient('${address}')`;

    if (filters[0] + '' === '') {
        fn(expression);
        return;
    }

    // Only accept_on_match filters are ran on MailGun
    let sql: string = `
        SELECT type, find FROM filters WHERE filter_id IN (?)
        AND accept_on_match = 1 AND type IN (1, 2, 3, 6)
    `;
    cn.query(sql, [filters.join(", ")], (err, rows) => {
        for (let row of rows) {
            switch (row.type) {
                case 1:
                    expression += ` and match_header('subject', '${row.find}')`; break;
                case 2:
                    expression += ` and match_header('from', '${row.find}')`; break;
                case 3:
                    expression += ` and match_header('from', '(.*)@${row.find}')`; break;
                case 6:
                    expression += ` and match_header('${row.find.split(":::")[0]}', '${row.find.split(":::")[1]}')`;
            }
        }

        fn(expression);
    });

};