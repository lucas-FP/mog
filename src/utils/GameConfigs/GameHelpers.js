module.exports = {
  createGameGrid(xSize, ySize) {
    let gameGrid = '';
    for (let i = 0; i < ySize; i++) {
      for (let j = 0; j < xSize - 1; j++) {
        gameGrid += ',';
      }
      if (i !== ySize - 1) gameGrid += '\n';
    }
    return gameGrid;
  },

  parseGameGrid(gameGridString) {
    const rows = gameGridString.split('\n');

    return rows.map((row) => row.split(','));
  },

  stringifyGameGrid(gameGrid) {
    let rows = [];
    gameGrid.forEach((r) => rows.push(r.join(',')));
    return rows.join('\n');
  },

  GRID_DIRECTIONS: {
    UP: [-1, 0],
    UP_RIGHT: [-1, 1],
    RIGHT: [0, 1],
    DOWN_RIGHT: [1, 1],
    DOWN: [1, 0],
    DOWN_LEFT: [1, -1],
    LEFT: [0, -1],
    UP_LEFT: [-1, -1],
  },

  gridMoveGet(grid, initX, initY, direction, offset = 1) {
    const maxY = grid.length - 1;
    const maxX = grid[0].length - 1;

    let newY = initY + direction[0] * offset;
    let newX = initX + direction[1] * offset;

    if (newY < 0 || newX < 0 || newX > maxX || newY > maxY) return null;
    return grid[newY][newX];
  },

  getTurnPlayer(players, turn) {
    const nPlayers = players.length;
    const turnIndex = turn % nPlayers;
    return players[turnIndex];
  },
};
