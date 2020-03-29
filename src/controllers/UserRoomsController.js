const connection = require('../database/connection');
const KnexError = require('../utils/errors/KnexError');

module.exports = {
  async index(req, res) {
    const { page = 1 } = req.query;

    const userId = req.session.userId;

    const countPromise = connection('rooms')
      .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
      .where('hostId', userId)
      .orWhere('userId', userId)
      .distinct()
      .count();
    const roomsPromise = connection('rooms')
      .leftJoin('usersRooms', 'usersRooms.roomId', '=', 'rooms.id')
      .limit(5)
      .offset((page - 1) * 5)
      .where('hostId', userId)
      .orWhere('userId', userId)
      .distinct()
      .select('*');
    try {
      const [count, rooms] = await Promise.all([countPromise, roomsPromise]);
      res.header('X-Total-Count', count[0]['count(*)']);
      return res.json(rooms);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },
  async create(req, res) {
    const userId = req.session.userId;
    const { roomId, password } = req.body;

    try {
      const room = await connection('rooms')
        .where('id', roomId)
        .select('*')
        .first();

      if (room.password && password !== room.password)
        return res.status(401).json({ error: 'Incorrect password' });

      if (!room) return res.status(404).json({ error: 'Room not found' });

      await connection('usersRooms').insert({ userId, roomId });
      return res.json({ userId, roomId });
    } catch (err) {
      return KnexError.create(res, err);
    }
  },
  async delete(req, res) {
    const userId = req.session.userId;
    const { roomId } = req.params;

    try {
      const room = await connection('rooms')
        .where('id', roomId)
        .select('*')
        .first();

      if (!room) return res.status(404).json({ error: 'Room not found' });

      if (room.hostId == userId)
        return res
          .status(403)
          .json({ error: 'Host cannot leave room. Delete room instead.' });

      await connection('usersRooms')
        .where('userId', userId)
        .andWhere('roomId', roomId)
        .delete();
      return res.status(204).send();
    } catch (err) {
      return KnexError.create(res, err);
    }
  }
};
