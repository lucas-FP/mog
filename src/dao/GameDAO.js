const redis = require('../database/RedisConnection').asyncClient;
const GameStatus = require('../utils/GameConfigs/GameStatusEnum');
const { parseUserData, stringifyUserData } = require('../utils/SocketHelpers');

const gameExpiration = 8 * 60 * 60;

//TODO set other resources expiration time
//TODO separate game data and config data
//TODO change list for players to sets, maintain complete info only in player slot
//TODO less data repetition, similar to above

module.exports = function GameDAO(injectedGame) {
  return {
    create(roomId, gameCode, hostId, data) {
      const initializedData = injectedGame.initializeData(data);
      const insertKeys = Object.keys(initializedData);
      const optsArray = insertKeys.map((k) => [k, initializedData[k]]).flat();
      const gameDataArray = [
        'host',
        hostId,
        'gameCode',
        gameCode,
        'turnCounter',
        0,
        'gameStatus',
        GameStatus.NOT_STARTED,
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

    restart(roomId, gameId) {
      return this.getAllData(roomId, gameId).then((data) => {
        const initializedData = injectedGame.initializeData(data.gameData);
        initializedData.turnCounter = 0;
        initializedData.gameStatus = GameStatus.NOT_STARTED;
        initializedData.gameWinner = null;
        return this.insert(roomId, gameId, initializedData).then(() =>
          Promise.resolve(
            injectedGame.readData({
              ...data,
              gameData: initializedData,
            })
          )
        );
      });
    },

    enter(roomId, gameId, userData) {
      const key = `room:${roomId}:game:${gameId}:players`;
      const keyPersistent = `room:${roomId}:game:${gameId}:player-slots`;
      return Promise.all([
        redis.rpush(key, stringifyUserData(userData)),
        redis.lrange(keyPersistent, 0, -1),
      ]).then(([len, persistUsers]) => {
        if (persistUsers.length === 0)
          return redis
            .rpush(keyPersistent, stringifyUserData(userData))
            .then((len) => {
              redis.expire(keyPersistent, gameExpiration);
              return Promise.resolve(len);
            });
        if (!persistUsers.map((u) => parseUserData(u).id).includes(userData.id))
          return redis.rpush(keyPersistent, stringifyUserData(userData));
        else return Promise.resolve(len);
      });
    },

    leave(roomId, gameId, userData) {
      const key = `room:${roomId}:game:${gameId}:players`;
      return redis.lrem(key, 0, stringifyUserData(userData));
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
      if (key === 'player-slots')
        return redis
          .lrange(`${docKey}:player-slots`, 0, -1)
          .then((players) =>
            Promise.resolve(players.map((p) => parseUserData(p)))
          );
      if (key === 'playersLen') return redis.llen(`${docKey}:players`);
      else if (Array.isArray(key)) return redis.hmget(docKey, key);
      else return redis.hget(docKey, key);
    },

    incrTurn(roomId, gameId) {
      const key = `room:${roomId}:game:${gameId}`;
      return redis.hincrby(key, 'turnCounter', 1);
    },

    getAllData(roomId, gameId) {
      const key = `room:${roomId}:game:${gameId}`;
      return Promise.all([
        redis.hgetall(key),
        this.get(roomId, gameId, 'players'),
        this.get(roomId, gameId, 'player-slots'),
      ]).then(([d, p, s]) => {
        return d
          ? injectedGame.readData({
              connectedUsers: p,
              playerSlots: s,
              gameData: d,
            })
          : d;
      });
    },
  };
};
