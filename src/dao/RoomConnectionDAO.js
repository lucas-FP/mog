const redis = require('../database/RedisConnection').asyncClient;
const { stringifyUserData, parseUserData } = require('../utils/SocketHelpers');
const GameDAO = require('../dao/GameDAO');

//TODO set expiration dates to all data
module.exports = {
  getConnectedUsers(roomId) {
    const key = `room:${roomId}:users`;
    return redis
      .lrange(key, 0, -1)
      .then((users) => Promise.resolve(users.map((u) => parseUserData(u))));
  },

  connectUserInRoom(userData, roomId) {
    const key = `room:${roomId}:users`;
    return redis.rpush(key, stringifyUserData(userData));
  },

  disconnectUserFromRooom(userData, roomId) {
    const key = `room:${roomId}:users`;
    console.log(stringifyUserData(userData));
    return redis.lrem(key, 0, stringifyUserData(userData));
  },

  pushMessage(roomId, message) {
    const key = `room:${roomId}:chat`;
    return redis.rpush(key, JSON.stringify(message));
  },

  //TODO create message pagination
  getMessages(roomId) {
    const key = `room:${roomId}:chat`;
    return redis
      .lrange(key, 0, -1)
      .then((msgs) => Promise.resolve(msgs.map((m) => JSON.parse(m))));
  },

  pushGame(roomId, hostId, { gameCode, gameConfig }) {
    const key = `room:${roomId}:games`;
    let newId;
    return GameDAO.create(roomId, gameCode, hostId, gameConfig)
      .then((gameId) => {
        newId = gameId;
        return redis.rpush(key, gameId);
      })
      .then(() => Promise.resolve(newId));
  },

  //TODO create games pagination
  getGames(roomId) {
    const key = `room:${roomId}:games`;
    let allIds;
    return redis
      .lrange(key, 0, -1)
      .then((gameIds) => {
        allIds = gameIds;
        return Promise.all(gameIds.map((g) => GameDAO.getAllData(roomId, g)));
      })
      .then((allData) => {
        const validGames = allData.filter((d) => Object.keys(d).length !== 0);
        const invalidIds = allIds.filter(
          (_id, i) => Object.keys(allData[i]).length === 0
        );
        invalidIds.forEach((id) => redis.lrem(key, 0, id));
        return Promise.resolve(validGames);
      });
  },

  getRoomData(roomId) {
    return Promise.all([
      this.getConnectedUsers(roomId),
      this.getMessages(roomId),
      this.getGames(roomId),
    ]).then(([connectedUsers, messageList, gamesList]) =>
      Promise.resolve({ connectedUsers, messageList, gamesList })
    );
  },
};
