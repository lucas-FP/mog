const GameDAO = require('../dao/GameDAO');

module.exports = {
  async create(req, res) {
    const { roomId, gameCode } = req.params;
    const hostId = req.session.userId;
    try {
      const opts = {
        xSize: 3,
        ySize: 3,
        maxPlayers: 2,
        minPlayers: 2,
        connectSize: 3,
        gravity: false,
      };
      const gameId = await GameDAO.create(roomId, gameCode, hostId, opts);
      res.json(gameId);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  async enter(req, res) {
    const { roomId, gameId } = req.params;
    const userId = req.session.userId;

    const maxPlayers = GameDAO.get(roomId, gameId, 'maxPlayers');
    const actualPlayers = GameDAO.get(roomId, gameId, 'playersLen');

    if (actualPlayers >= maxPlayers)
      return res.status(400).json({ error: 'Game is already full' });

    try {
      await GameDAO.enter(roomId, gameId, userId);
      const gameData = await GameDAO.getAllData(roomId, gameId);
      return res.json(gameData);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },
};
