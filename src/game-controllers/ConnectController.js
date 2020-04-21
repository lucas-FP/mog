const GameHelpers = require('../utils/GameConfigs/GameHelpers');
const GameStatus = require('../utils/GameConfigs/GameStatusEnum');
const GameDAO = require('../dao/GameDAO');

//TODO make better turn management
const checkVictory = (x, y, turnNumber, grid, connectSize) => {
  const directions = GameHelpers.GRID_DIRECTIONS;
  const axisCount = [0, 0, 0, 0];
  for (let d in directions) {
    const direction = GameHelpers.GRID_DIRECTIONS[d];
    for (let i = 1; i < connectSize; i++) {
      const el = GameHelpers.gridMoveGet(grid, x, y, direction, i);
      if (el === turnNumber.toString()) {
        axisCount[GameHelpers.GRID_AXIS[d]]++;
      } else break;
    }
  }
  if (axisCount.find((ax) => ax >= connectSize - 1)) return turnNumber;
  if (grid.flat().filter((v) => v === '').length === 0) return -1;
  else return null;
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

//Todo think of better way to inject this function on DAO
const readData = (allData) => {
  const { gameData } = allData;

  //Parses grid
  gameData.grid = GameHelpers.parseGameGrid(gameData.grid);

  //Inserts player turn into data
  gameData.turnPlayer = GameHelpers.getTurnPlayer(
    allData.playerSlots,
    allData.gameData.turnCounter
  );

  //Forces victory player cleaning
  gameData.victoryPlayer = null;
  return allData;
};

module.exports = {
  initializeData(gameConfig) {
    const { xSize, ySize } = gameConfig;
    gameConfig.turnPlayer = null;
    gameConfig.gameWinner = null;
    const grid = GameHelpers.createGameGrid(xSize, ySize);
    return { ...gameConfig, grid };
  },

  readData,

  async processAction(roomId, gameId, action, stateEmitter, eventEmitter) {
    const turnCounter = await GameDAO().get(roomId, gameId, 'turnCounter');
    const players = await GameDAO().get(roomId, gameId, 'player-slots');
    const isPlayerTurn =
      GameHelpers.getTurnPlayer(players, turnCounter).id === action.playerId;
    const turnIndex = GameHelpers.getTurnIndex(players, turnCounter);

    if (!isPlayerTurn) eventEmitter(action);
    else {
      const { gameData } = await GameDAO({ readData }).getAllData(
        roomId,
        gameId
      );
      const grid = gameData.grid;
      //TODO returnproper errors
      if (grid[action.y][action.x] !== '') return;
      if (gameData.gameStatus !== GameStatus.ONGOING) return;
      //TODO change to unset, not string
      if (gameData.gravity && gameData.gravity !== 'false')
        action.y = applyGravity(action.x, action.y, grid);
      grid[action.y][action.x] = turnIndex;
      const victory = checkVictory(
        action.x,
        action.y,
        turnIndex,
        gameData.grid,
        gameData.connectSize
      );

      const victoryPlayer =
        victory === null
          ? null
          : victory === -1
          ? { id: null, msg: 'Tie' }
          : players[victory];

      await Promise.all([
        GameDAO().insert(roomId, gameId, {
          gameStatus:
            victory != null ? GameStatus.FINISHED : GameStatus.ONGOING,
          gameWinner: victory,
          //TODO stringify method should also be injected
          grid: GameHelpers.stringifyGameGrid(grid),
        }),
        GameDAO().incrTurn(roomId, gameId),
      ]);

      const gameState = await GameDAO({ readData }).getAllData(roomId, gameId);
      gameState.gameData.victoryPlayer = victoryPlayer;
      stateEmitter(gameState);
    }
  },
};
