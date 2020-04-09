const connection = require('../database/SqlConnection');
const redis = require('../database/RedisConnection').asyncClient;

module.exports = {
  paginatePublicRooms(pageSize, page) {
    return Promise.all([
      connection('rooms').count(),
      connection('rooms')
        .where('isPublic', true)
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .select('*'),
    ]);
  },

  find(id) {
    return connection('rooms').where('id', id).select('*').first();
  },

  create(hostId, maxPlayers, isPublic, password) {
    return connection('rooms').insert({
      hostId,
      maxPlayers,
      isPublic,
      password,
    });
  },

  delete(id) {
    Promise.all([
      connection('rooms').where('id', id).delete(),
      connection('usersRooms').where('roomId', id).delete(),
    ]);
  },

  pushMessage(id, message) {
    const key = `room:${id}:chat`;
    return redis.rpush(key, message);
  },
};
