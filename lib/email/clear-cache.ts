import redis = require("redis");

if (global["__redis"] === undefined) {
    let config = require("../../config").database;
    global["__redis"] = require("sol-redis-pool")(
        config.redis, config.redisPool
    );
}

export = function (email: number) {

    global["__redis"].acquire((err, redis: redis.RedisClient) => {
        redis.del(email, (err, reply) => {
            global["__redis"].release(redis);
        });
    });

};