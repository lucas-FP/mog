const redis = require('redis');
const redisClient = redis.createClient();
const { promisify } = require('util');

redisClient.on('error', function (error) {
  console.error(error);
});

const get = promisify(redisClient.get).bind(redisClient);
const hset = promisify(redisClient.hmset).bind(redisClient);
const hget = promisify(redisClient.hget).bind(redisClient);
const hmget = promisify(redisClient.hmget).bind(redisClient);
const hincrby = promisify(redisClient.hincrby).bind(redisClient);
const expire = promisify(redisClient.expire).bind(redisClient);
const lpush = promisify(redisClient.lpush).bind(redisClient);
const rpush = promisify(redisClient.rpush).bind(redisClient);
const lrange = promisify(redisClient.lrange).bind(redisClient);
const llen = promisify(redisClient.llen).bind(redisClient);
const hgetall = promisify(redisClient.hgetall).bind(redisClient);
const lrem = promisify(redisClient.lrem).bind(redisClient);
const exists = promisify(redisClient.exists).bind(redisClient);

module.exports = {
  redisClient,
  asyncClient: {
    get,
    hset,
    hget,
    hmget,
    hincrby,
    expire,
    lpush,
    rpush,
    lrange,
    llen,
    hgetall,
    lrem,
    exists,
  },
};
