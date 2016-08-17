const redis = require("redis");

if (global["__redis"] === undefined) {
    let config = require("config").database;
    global["__redis"] = require("sol-redis-pool")(
        config.redis, config.redisPool
    );
}

module.exports = function(email) {

    global["__redis"].acquire((err, redis) => {
        redis.del(email, (err, reply) => {
            global["__redis"].release(redis);
        });
    });

};