const redis = require('../database/RedisConnection').asyncClient;

module.exports = {
  create(roomId, gameCode, hostId, opts) {
    const insertKeys = Object.keys(opts);
    const optsArray = insertKeys.map((k) => [k, opts[k]]).flat();
    const gameDataArray = ['host', hostId, 'gameCode', gameCode, ...optsArray];

    //Getting room's game Id
    return redis
      .hget(`room:${roomId}`, 'gameCount')
      .then((gameId) => {
        //If there is no id, then create room entry, then pass Id forward
        let promise;
        if (!gameId) {
          promise = redis
            .hset(`room:${roomId}`, 'gameCount', 1)
            .then(() => Promise.resolve(1));
        } else promise = Promise.resolve(gameId);
        return promise;
      })
      .then((gameId) => {
        const gamePromise = redis
          .hset(`room:${roomId}:game:${gameId}`, gameDataArray)
          .then(() => redis.expire(`room:${roomId}:game:${gameId}`, 28800000));
        const incrPromise = redis.hincrby(`room:${roomId}`, 'gameCount', 1);
        return Promise.all([gamePromise, incrPromise]).then(() =>
          Promise.resolve(Number(gameId))
        );
      });
  },

  enter(roomId, gameId, userId) {
    return redis.rpush(`room:${roomId}:game:${gameId}:users`, userId);
  },

  insert(roomId, gameId, data) {
    const insertKeys = Object.keys(data);
    const dataArray = insertKeys.map((k) => [k, data[k]]).flat();
    return redis.hset(`room:${roomId}:game:${gameId}`, dataArray);
  },

  get(roomId, gameId, key) {
    const docKey = `room:${roomId}:game:${gameId}`;
    if (key === 'players') return redis.lrange(`${docKey}:users`, 0, -1);
    if (key === 'playersLen') return redis.llen(`${docKey}:users`);
    else if (key && key.length > 1) return redis.hget(docKey, key);
    else return redis.hmget(docKey, key);
  },

  getAllData(roomId, gameId) {
    return redis.hgetall(roomId, gameId);
  },
};
