const GameHelpers = require('./src/utils/GameConfigs/GameHelpers');

const checkVictory = (x, y, playerId, grid, connectSize) => {
  const directions = GameHelpers.GRID_DIRECTIONS;
  for (let d in directions) {
    const direction = GameHelpers.GRID_DIRECTIONS[d];
    console.log(direction);
    let unbroken = true;
    for (let i = 1; i < connectSize; i++) {
      const el = GameHelpers.gridMoveGet(grid, x, y, direction, i);
      if (Number(el) !== playerId) {
        unbroken = false;
        break;
      }
    }
    if (unbroken) return true;
  }
  return false;
};

const applyGravity = (x, y, grid) => {
  let element = grid[y][x];
  let newY = y;
  while (element === '' && newY < grid.length) {
    element = GameHelpers.gridMoveGet(
      grid,
      x,
      newY,
      GameHelpers.GRID_DIRECTIONS.DOWN
    );
    newY++;
  }
  return newY - 1;
};

const gridString = `1,,
,1,
,,`;

const grid = GameHelpers.parseGameGrid(gridString);

console.log(grid);

console.log(applyGravity(1, 0, grid));

console.log(checkVictory(1, 0, 1, grid, 3));

console.log(checkVictory(1, 0, 1, grid, 2));
console.log(checkVictory(2, 2, 1, grid, 3));
