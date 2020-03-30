const connection = require('../database/connection');

module.exports = {
  paginatePublicRooms(pageSize, page) {
    return Promise.all([
      connection('rooms').count(),
      connection('rooms')
        .where('isPublic', true)
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .select('*')
    ]);
  },

  find(id) {
    return connection('rooms')
      .where('id', id)
      .select('*')
      .first();
  },

  create(
    id,
    hostId,
    maxPlayers,
    initialLives,
    deckSize,
    isPublic,
    password,
    turnTimeout,
    livesPerPlayer,
    incrementalTimeout
  ) {
    return connection('rooms').insert({
      id,
      hostId,
      maxPlayers,
      initialLives,
      deckSize,
      isPublic,
      password,
      turnTimeout,
      livesPerPlayer,
      incrementalTimeout
    });
  },

  delete(id) {
    Promise.all([
      connection('rooms')
        .where('id', id)
        .delete(),
      connection('usersRooms')
        .where('roomId', id)
        .delete()
    ]);
  }
};
