const bcrypt = require('bcrypt');
const Errors = require('../utils/Errors');
const UserDAO = require('../dao/UserDAO');
const RoomDAO = require('../dao/RoomDAO');

module.exports = {
  async index(_req, res) {
    try {
      const users = await UserDAO.index();
      return res.json(users);
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async create(req, res) {
    const { nick, isGuest, userName, password } = req.body;

    if (!isGuest && !password)
      return res.status(400).json({
        error: 'Invalid password',
        details: 'Received falsy password for non guest user',
      });
    if (!isGuest && !userName)
      return res.status(400).json({
        error: 'Invalid user name',
        details: 'Received falsy user name for non guest user',
      });

    bcrypt.hash(password, 10, async (err, hash) => {
      if (password == null || !err) {
        try {
          const [id] = await UserDAO.create(
            nick,
            isGuest,
            userName,
            password == null ? null : hash
          );
          req.session.userId = id;
          return res.json(id);
        } catch (err) {
          Errors.knex(res, err);
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
      return Errors.knex(res, err);
    }
  },

  async addUserToRoom(req, res) {
    const userId = req.params;
    const { roomId, password } = req.body;

    try {
      const room = await RoomDAO.find(roomId);

      if (room.password && password !== room.password)
        return res.status(401).json({ error: 'Incorrect password' });

      if (!room) return res.status(404).json({ error: 'Room not found' });

      await UserDAO.addUserToRoom(userId, roomId);
      return res.json({ userId, roomId });
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async enterRoom(req, res) {
    const userId = req.session.userId;
    const { roomId } = req.params;
    const password = req.body;

    try {
      const room = await RoomDAO.find(roomId);

      if (room.password && password !== room.password)
        return res.status(401).json({ error: 'Incorrect password' });

      if (!room) return res.status(404).json({ error: 'Room not found' });

      await UserDAO.addUserToRoom(userId, roomId);
      return res.json({ userId, roomId });
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async removeUserFromRoom(req, res) {
    const { roomId } = req.params;
    const userId = req.session.userId;

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
      return Errors.knex(res, err);
    }
  },
};
