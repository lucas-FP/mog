const redis = require('../database/RedisConnection').asyncClient;

module.exports = {
  getConnctedUsers(roomId) {
    const key = `room:${roomId}:users`;
    return redis.lrange(key, 0, -1);
  },

  connectUserInRoom(userId, roomId) {
    const key = `room:${roomId}:users`;
    return redis.rpush(key, userId);
  },

  disconnectUserFromRooom(userId, roomId) {
    const key = `room:${roomId}:users`;
    return redis.lrem(key, 0, userId);
  },

  pushMessage(message, roomId) {
    const key = `room:${roomId}:chat`;
    return redis.rpush(key, message);
  },

  getMessages(roomId) {
    const key = `room:${roomId}:chat`;
    return redis.lrange(key, 0, -1);
  },

  getRoomData(roomId) {
    return Promise.all([
      this.getConnectedUsers(roomId),
      this.getMessages(roomId),
    ]);
  },
};
