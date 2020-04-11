const SocketHelpers = require('../utils/SocketHelpers');
const Errors = require('../utils/Errors');
const GameDAO = require('../dao/GameDAO');
const GameStates = require('../utils/GameConfigs/GameStatesEnum');

const createStateEmittter = (socket, roomKey) => {
  return (state) => {
    socket.in(roomKey).emit('state', state);
  };
};

const createEventEmittter = (socket, roomKey) => {
  return (event) => {
    socket.in(roomKey).emit('event', event);
  };
};

module.exports = {
  async enter(socket, { roomId, gameId }) {
    const userData = SocketHelpers.getUserData(socket);

    if (!userData) return Errors.socketUserNotLogged(socket);
    try {
      const maxPlayers = await GameDAO.get(roomId, gameId, 'maxPlayers');
      const actualPlayers = await GameDAO.get(roomId, gameId, 'players');

      if (actualPlayers.length >= maxPlayers)
        return Errors.socketRoomFull(socket);

      if (actualPlayers.includes(userData.id))
        return Errors.socketAlreadyConnected(socket);

      const gameState = await GameDAO.get(roomId, gameId, 'gameState');
      if (gameState !== GameStates.NOT_STARTED)
        return Errors.socketGameAlreadyStarted(socket);

      await GameDAO.enter(roomId, gameId, userData.id);
      const roomKey = `${roomId}:${gameId}`;
      socket.join(roomKey);
      socket.in(roomKey).emit('entered', userData);
      const gameData = await GameDAO.getAllData(roomId, gameId);
      socket.emit(gameData);
    } catch (err) {
      return Errors.socketError(socket, err);
    }
  },

  control(socket, { action, roomId, gameId }, controller) {
    const userData = SocketHelpers.getUserData(socket);
    action.playerId = userData.id;
    const roomKey = `${roomId}:${gameId}`;
    controller(
      roomId,
      gameId,
      action,
      createStateEmittter(socket, roomKey),
      createEventEmittter(socket, roomKey)
    );
  },

  async start(socket, { roomId, gameId }) {
    try {
      await GameDAO.insert(roomId, gameId, { gameState: GameStates.ONGOING });
      const roomKey = `${roomId}:${gameId}`;
      socket.in(roomKey).emit('started');
    } catch (err) {
      return Errors.socketError(socket, err);
    }
  },

  async leave(socket, { roomId, gameId }) {
    const userData = SocketHelpers.getUserData(socket);
    try {
      await GameDAO.leave(roomId, gameId, userData.id);
      const roomKey = `${roomId}:${gameId}`;
      socket.to(roomKey).emit('left', userData);
      socket.leave(roomKey);
    } catch (err) {
      return Errors.socketError(socket, err);
    }
  },
};
