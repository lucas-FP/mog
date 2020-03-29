const connection = require('../database/connection');
const crypto = require('crypto');

const KnexError = require('../utils/errors/KnexError');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;

    const countPromise = connection('rooms').count();
    const roomsPromise = connection('rooms')
      .where('isPublic', true)
      .limit(5)
      .offset((page - 1) * 5)
      .select('*');
    try {
      const [count, rooms] = await Promise.all([countPromise, roomsPromise]);
      res.header('X-Total-Count', count[0]['count(*)']);
      return res.json(rooms);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async find(req, res) {
    const { id } = req.params;
    try {
      const room = await connection('rooms')
        .where('id', id)
        .select('*')
        .first();
      if (!room) return res.status(404).json({ error: 'Room not found.' });
      return res.json(room);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async create(req, res) {
    const {
      maxPlayers,
      initialLives,
      deckSize,
      isPublic,
      password,
      turnTimeout,
      livesPerPlayer,
      incrementalTimeout
    } = req.body;

    const hostId = req.session.userId;

    const id = crypto.randomBytes(4).toString('HEX');

    try {
      const owner = await connection('users')
        .where('id', hostId)
        .select('*')
        .first();

      if (!owner) return res.status(404).json({ error: 'Host user not found' });

      await connection('rooms').insert({
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

      return res.json({ id });
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    const hostId = req.session.userId;

    try {
      const found = await connection('rooms')
        .where('id', id)
        .select('*')
        .first();

      if (!found) return res.status(404).json({ error: 'Room not found.' });

      if (found.hostId !== hostId)
        return res
          .status(403)
          .json({ error: 'Cannot delete a room you are not a host of.' });

      await Promise.all([
        connection('rooms')
          .where('id', id)
          .delete(),
        connection('usersRooms')
          .where('roomId', id)
          .delete()
      ]);

      return res.status(204).send();
    } catch (err) {
      return KnexError.create(res, err);
    }
  }
};
