const GameDAO = require('../dao/GameDAO');
const GameHelpers = require('../utils/GameConfigs/GameHelpers');
const GameStates = require('../utils/GameConfigs/GameStatesEnum');

const checkVictory = (x, y, playerId, grid, connectSize) => {
  const directions = GameHelpers.GRID_DIRECTIONS;
  for (let d in directions) {
    let chain = 1;
    let unbroken = true;
    while (unbroken) {
      const checkGrid = GameHelpers.gridMoveGet(
        grid,
        x,
        y,
        GameHelpers.GRID_DIRECTIONS[d],
        chain
      );
      if (checkGrid === playerId) chain++;
      else unbroken = false;
      if (chain === connectSize) return true;
    }
  }
  return false;
};

const applyGravity = (x, y, grid) => {
  let element;
  let newY = y;
  while (element !== '') {
    newY--;
    element = GameHelpers.gridMoveGet(
      grid,
      x,
      newY,
      GameHelpers.GRID_DIRECTIONS.DOWN
    );
  }
  newY++;
  return newY;
};

module.exports = async function processAction(
  roomId,
  gameId,
  action,
  stateEmitter,
  eventEmitter
) {
  const turnCounter = await GameDAO.get(roomId, gameId, 'turnCounter');
  const players = await GameDAO.get(roomId, gameId, 'players');
  const isPlayerTurn =
    GameHelpers.getTurnPlayer(players, turnCounter) === action.playerId;

  if (!isPlayerTurn) eventEmitter(action);
  else {
    const gameData = await GameDAO.getAllData(roomId, gameId);
    const grid = GameHelpers.parseGameGrid(gameData.grid);
    //TODO returnproper errors
    if (grid[action.y][action.x] !== '') return;
    if (gameData.gameState !== GameStates.ONGOING) return;
    if (gameData.gravity) action.y = applyGravity(action.x, action.y, grid);
    const victory = checkVictory(
      action.x,
      action.y,
      action.playerId,
      gameData.grid
    );

    await Promise.all([
      GameDAO.insert(roomId, gameId, {
        gameState: victory ? GameStates.FINISHED : GameStates.ONGOING,
        gameWinner: victory ? action.playerId : null,
        grid: GameHelpers.stringifyGameGrid(grid),
      }),
      GameDAO.incrTurn(roomId, gameId),
    ]);

    stateEmitter(await GameDAO.getAllData(roomId, gameId));
  }
};
