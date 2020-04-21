const GamesEnum = require('./GameCodeEnum');

const data = {};

data[GamesEnum.CONNECT] = {
  xSize: 3,
  ySize: 3,
  maxPlayers: 2,
  minPlayers: 2,
  connectSize: 3,
  gravity: false,
};

module.exports = data;
