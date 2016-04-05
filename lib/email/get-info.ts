import redis = require("redis");
import db = require("../db");

if (global["__redis"] === undefined) {
    let config = require("../../config").database;
    global["__redis"] = require("sol-redis-pool")(
        config.redis, config.redisPool
    );
}

/* Retrieve Data for /receive/ Controllers */
export = function (email: number, free: boolean, fn: Function) {

    global["__redis"].acquire((err, redis: redis.RedisClient) => {
        redis.get(email, (err, value) => {

            // Attempt to load data from MySQL
            if (err || !value) {
                let data = { to: "", filters: [], modifiers: [] };
                
                // Grab to_email address
                let sql: string = `
                    SELECT address FROM mail_emails WHERE email_id IN (
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
                            });
                            return;
                        }

                        // Grab all filters that MailGun hasn't already used
                        sql = `
                            SELECT type, find, accept_on_match, use_regex FROM filters
                            WHERE filter_id IN (
                                SELECT filter_id FROM linked_filters WHERE email_id = ?
                            ) AND NOT (accept_on_match = 1 AND type IN (1, 2, 3, 6))
                        `;
                        cn.query(sql, [email], (err, rows) => {
                            data.filters = rows;

                            // Load modifiers
                            sql = `
                                SELECT type, data FROM modifiers WHERE modifier_id IN (
                                    SELECT modifier_id FROM linked_modifiers WHERE email_id = ?
                                )
                            `;
                            cn.query(sql, [email], (err, rows) => {
                                cn.release();

                                // Parse modifier.data if it's a JSON string
                                data.modifiers = rows.map((mod) => {
                                    return {
                                        type: mod.type, data: (mod.data != '') ? JSON.parse(mod.data) : ''
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