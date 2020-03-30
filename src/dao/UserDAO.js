const connection = require('../database/connection');

module.exports = {
  index() {
    return connection('users').select('*');
  },

  find(id) {
    return connection('users')
      .where('id', id)
      .select('*')
      .first();
  },

  findByName(userName) {
    return connection('users')
      .where('userName', userName)
      .select('*')
      .first();
  },

  create(id, nick, isGuest, userName, password) {
    return connection('users').insert({
      id,
      nick,
      isGuest,
      userName,
      password
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
        .select('*')
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
  }
};
