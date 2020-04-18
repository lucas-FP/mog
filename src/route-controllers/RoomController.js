const RoomDAO = require('../dao/RoomDAO');
const UserDAO = require('../dao/UserDAO');

const Errors = require('../utils/Errors');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;
    try {
      const [count, rooms] = await RoomDAO.paginatePublicRooms(5, page);
      res.header('X-Total-Count', count[0]['count(*)']);
      return res.json(rooms);
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async find(req, res) {
    const { id } = req.params;
    try {
      const room = await RoomDAO.find(id);
      if (!room) return res.status(404).json({ error: 'Room not found.' });
      return res.json(room);
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async create(req, res) {
    const { name, maxPlayers, isPublic, password } = req.body;

    const hostId = req.session.userId;

    try {
      const owner = await UserDAO.find(hostId);

      if (!owner) return res.status(404).json({ error: 'Host user not found' });

      const [roomId] = await RoomDAO.create(
        hostId,
        name,
        maxPlayers,
        isPublic,
        password
      );

      return res.json(roomId);
    } catch (err) {
      return Errors.knex(res, err);
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
      return Errors.knex(res, err);
    }
  },
};
