const connection = require('../database/SqlConnection');
const redis = require('../database/RedisConnection').asyncClient;

module.exports = {
  index() {
    return connection('users').select('*');
  },

  find(id) {
    return connection('users').where('id', id).select('*').first();
  },

  findByName(userName) {
    return connection('users').where('userName', userName).select('*').first();
  },

  create(nick, isGuest, userName, password) {
    return connection('users').insert({
      nick,
      isGuest,
      userName,
      password,
    });
  },

  paginateUserRooms(userId, pageSize, page) {
    return Promise.all([
      connection('rooms')
        .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
        .where('hostId', userId)
        .orWhere('userId', userId)
        .distinct()
        .count(),
      connection('rooms')
        .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .where('hostId', userId)
        .orWhere('userId', userId)
        .distinct()
        .select('*'),
    ]);
  },

  addUserToRoom(userId, roomId) {
    return connection('usersRooms').insert({ userId, roomId });
  },

  removeUserFromRoom(userId, roomId) {
    return connection('usersRooms')
      .where('userId', userId)
      .andWhere('roomId', roomId)
      .delete();
  },

  findUserInRoom(userId, roomId) {
    return Promise.all([
      connection('usersRooms')
        .where('userId', userId)
        .andWhere('roomId', roomId)
        .select('*')
        .first(),
      connection('rooms')
        .where('hostId', userId)
        .andWhere('id', roomId)
        .select('*')
        .first(),
    ]);
  },

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
};
