const redis = require("redis");
const db = require("lib/db");

if (global["__redis"] === undefined) {
    let config = require("config").database;
    global["__redis"] = require("sol-redis-pool")(
        config.redis, config.redisPool
    );
}

/* Retrieve Data for /receive/ Controllers */
module.exports = function(email, free, save, fn) {

    global["__redis"].acquire((err, redis) => {
        redis.get(email, (err, value) => {

            // Attempt to load data from MySQL
            if (err || !value) {
                let data = { to: "", filters: [], modifiers: [] };
                
                // Grab to_email address
                let sql = `
                    SELECT address FROM main_emails WHERE email_id IN (
                        SELECT to_email FROM redirect_emails WHERE email_id = ?
                    )
                `;
                db(cn => cn.query(sql, [email], (err, rows) => {
                    if (err || !rows.length) {
                        global["__redis"].release(redis);
                        cn.release();
                        fn(true);
                    }
                    else {
                        data.to = rows[0].address;

                        // Free members won't have an filters/modifiers here
                        if (free) {
                            redis.set(email, JSON.stringify(data), (err, reply) => {
                                redis.expire(email, 600);
                                global["__redis"].release(redis);

                                fn(false, data);
                            }); return;
                        }

                        // Grab all filters
                        // pass is set to 1 if MailGun already validated
                        sql = `
                            SELECT type, find, accept_on_match as acceptOnMatch, IF(
                                ${save ? 0 : 1} = 1 AND accept_on_match = 1
                                AND type IN (1, 2, 3, 6),
                                1, 0
                            ) as pass
                            FROM filters WHERE filter_id IN (
                                SELECT filter_id FROM linked_filters WHERE email_id = ?
                            )
                        `;
                        cn.query(sql, [email], (err, rows) => {
                            data.filters = rows;

                            // Load modifiers
                            sql = `
                                SELECT
                                    modifiers.type, modifiers.data
                                FROM
                                    modifiers, linked_modifiers
                                WHERE
                                    modifiers.modifier_id = linked_modifiers.modifier_id
                                    AND linked_modifiers.email_id = ?
                                ORDER BY linked_modifiers.order_number
                            `;
                            cn.query(sql, [email], (err, rows) => {
                                cn.release();

                                // Parse modifier.data if it's a JSON string
                                data.modifiers = rows.map((mod) => {
                                    return {
                                        type: mod.type, data: mod.data.substr(0, 1) == '{'
                                            ? JSON.parse(mod.data) : mod.data
                                    };
                                });

                                // Insert data into Redis
                                redis.set(email, JSON.stringify(data), (err, reply) => {
                                    redis.expire(email, 600);
                                    global["__redis"].release(redis);

                                    // Send data to callback
                                    fn(false, data);
                                });
                            });
                        });
                    }
                }));
            }

            // Output data and reset timeout
            else {
                redis.expire(email, 600);
                global["__redis"].release(redis);
                fn(false, JSON.parse(value));
            }

        });
    });

};