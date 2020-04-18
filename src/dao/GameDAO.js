const redis = require('../database/RedisConnection').asyncClient;
const GameStates = require('../utils/GameConfigs/GameStatesEnum');
const { initializeData } = require('../game-controllers/ConnectController');
const { parseUserData, stringifyUserData } = require('../utils/SocketHelpers');

const gameExpiration = 28800000;

//TODO set other resources expiration time
module.exports = {
  create(roomId, gameCode, hostId, data) {
    const initializedData = initializeData(data);
    const insertKeys = Object.keys(initializedData);
    const optsArray = insertKeys.map((k) => [k, initializedData[k]]).flat();
    const gameDataArray = [
      'host',
      hostId,
      'gameCode',
      gameCode,
      'turnCounter',
      0,
      'gameState',
      GameStates.NOT_STARTED,
      ...optsArray,
    ];

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
          .hset(`room:${roomId}:game:${gameId}`, [
            'id',
            gameId,
            ...gameDataArray,
          ])
          .then(() =>
            redis.expire(`room:${roomId}:game:${gameId}`, gameExpiration)
          );
        const incrPromise = redis.hincrby(`room:${roomId}`, 'gameCount', 1);
        return Promise.all([gamePromise, incrPromise]).then(() =>
          Promise.resolve(Number(gameId))
        );
      });
  },

  enter(roomId, gameId, userData) {
    const key = `room:${roomId}:game:${gameId}:players`;
    return redis.rpush(key, stringifyUserData(userData));
  },

  leave(roomId, gameId, userId) {
    const key = `room:${roomId}:game:${gameId}:players`;
    return redis.lrem(key, 0, userId);
  },

  insert(roomId, gameId, data) {
    const insertKeys = Object.keys(data);
    const dataArray = insertKeys
      .filter((k) => data[k] !== null)
      .map((k) => [k, data[k]])
      .flat();
    return redis.hset(`room:${roomId}:game:${gameId}`, dataArray);
  },

  get(roomId, gameId, key) {
    const docKey = `room:${roomId}:game:${gameId}`;
    if (key === 'players')
      return redis
        .lrange(`${docKey}:players`, 0, -1)
        .then((players) =>
          Promise.resolve(players.map((p) => parseUserData(p)))
        );
    if (key === 'playersLen') return redis.llen(`${docKey}:players`);
    else if (key && key.length > 1) return redis.hget(docKey, key);
    else return redis.hmget(docKey, key);
  },

  incrTurn(roomId, gameId) {
    const key = `room:${roomId}:game:${gameId}`;
    return redis.hincrby(key, 'turnCounter', 1);
  },

  getAllData(roomId, gameId) {
    return redis.hgetall(roomId, gameId);
  },
};
