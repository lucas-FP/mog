const GameDAO = require('../dao/GameDAO');
const GameHelper = require('../utils/GameConfigs/GameHelpers');
const GameDefaults = require('../utils/GameConfigs/GameDefaults');
const ConnectController = require('../game-controllers/ConnectController');

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
        grid: GameHelper.createGameGrid(3, 3),
      };
      const gameId = await GameDAO(ConnectController).create(
        roomId,
        gameCode,
        hostId,
        opts
      );
      res.json(gameId);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  getDefault(req, res) {
    const { gameCode } = req.params;
    let defaultData = GameDefaults[gameCode];
    return res.json(defaultData);
  },
};
