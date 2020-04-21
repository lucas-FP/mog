const connection = require('../database/SqlConnection');

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
    return connection('users').insert(
      {
        nick,
        isGuest,
        userName,
        password,
      },
      ['id']
    );
  },

  paginateUserRooms(userId, pageSize, page) {
    return Promise.all([
      connection('rooms')
        .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
        .where('hostId', userId)
        .orWhere('userId', userId)
        .countDistinct('rooms.id'),
      connection('rooms')
        .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .where('hostId', userId)
        .orWhere('userId', userId)
        .distinct('rooms.id', 'rooms.name'),
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
};
