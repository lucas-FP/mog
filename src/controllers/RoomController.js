const crypto = require('crypto');

const RoomDAO = require('../dao/RoomDAO');
const UserDAO = require('../dao/UserDAO');

const KnexError = require('../utils/errors/KnexError');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;
    try {
      const [count, rooms] = await RoomDAO.publicPaginate(5, page);
      res.header('X-Total-Count', count[0]['count(*)']);
      return res.json(rooms);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async find(req, res) {
    const { id } = req.params;
    try {
      const room = await RoomDAO.find(id);
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
      const owner = await UserDAO.find(id);

      if (!owner) return res.status(404).json({ error: 'Host user not found' });

      await RoomDAO.create(
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
      );

      return res.json({ id });
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    const hostId = req.session.userId;

    try {
      const found = await RoomDAO.find(id);

      if (!found) return res.status(404).json({ error: 'Room not found.' });

      if (found.hostId !== hostId)
        return res
          .status(403)
          .json({ error: 'Cannot delete a room you are not a host of.' });

      await RoomDAO.delete();

      return res.status(204).send();
    } catch (err) {
      return KnexError.create(res, err);
    }
  }
};
