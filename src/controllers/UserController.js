const crypto = require('crypto');
const bcrypt = require('bcrypt');
const KnexError = require('../utils/errors/KnexError');
const UserDAO = require('../dao/UserDAO');
const RoomDAO = require('../dao/RoomDAO');

module.exports = {
  async index(_req, res) {
    try {
      const users = await UserDAO.index();
      return res.json(users);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async create(req, res) {
    const { nick, isGuest, userName, password } = req.body;

    const id = crypto.randomBytes(4).toString('HEX');

    bcrypt.hash(password, 10, async (err, hash) => {
      if (!err) {
        try {
          await UserDAO.create(id, nick, isGuest, userName, hash);
          req.session.userId = id;
          return res.json({ id });
        } catch (err) {
          KnexError.create(res, err);
        }
      } else return res.status(500).json({ error: 'Encryption error' });
    });
  },

  async paginateUserRooms(req, res) {
    const { page = 1 } = req.query;

    const userId = req.session.userId;

    try {
      const [count, rooms] = await UserDAO.paginateUserRooms(userId, 5, page);
      res.header('X-Total-Count', count[0]['count(*)']);
      return res.json(rooms);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async addUserToRoom(req, res) {
    const userId = req.session.userId;
    const { roomId, password } = req.body;

    try {
      const room = await RoomDAO.find(roomId);

      if (room.password && password !== room.password)
        return res.status(401).json({ error: 'Incorrect password' });

      if (!room) return res.status(404).json({ error: 'Room not found' });

      await UserDAO.linkUserToRoom(userId, roomId);
      return res.json({ userId, roomId });
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async removeUserFromRoom(req, res) {
    const userId = req.session.userId;
    const { roomId } = req.params;

    try {
      const room = await RoomDAO.find(roomId);

      if (!room) return res.status(404).json({ error: 'Room not found' });

      if (room.hostId == userId)
        return res
          .status(403)
          .json({ error: 'Host cannot leave room. Delete room instead.' });

      await UserDAO.removeUserFromRoom(userId, roomId);
      return res.status(204).send();
    } catch (err) {
      return KnexError.create(res, err);
    }
  }
};
