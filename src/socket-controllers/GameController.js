const SocketHelpers = require('../utils/SocketHelpers');
const Errors = require('../utils/Errors');
const GameDAO = require('../dao/GameDAO');
const UserDAO = require('../dao/UserDAO');
const GameStatus = require('../utils/GameConfigs/GameStatusEnum');
const ConnectController = require('../game-controllers/ConnectController');

const createStateEmittter = (socket, roomKey) => {
  return (state) => {
    socket.in(roomKey).emit('gameState', state);
  };
};

const createEventEmittter = (socket, roomKey) => {
  return (event) => {
    socket.in(roomKey).emit('gameEvent', event);
  };
};

module.exports = {
  async enter(socket, { roomId, gameId }) {
    const userData = SocketHelpers.getUserData(socket);

    try {
      if (!userData.id) return Errors.socketUserNotLogged(socket);

      //Is user allowed in room?
      const [userCheck, hostCheck] = await UserDAO.findUserInRoom(
        userData.id,
        roomId
      );
      if (!userCheck && !hostCheck) return Errors.socketUserNotAllowed(socket);

      //TODO change all hardcoded game controllers
      const maxPlayers = await GameDAO(ConnectController).get(
        roomId,
        gameId,
        'maxPlayers'
      );
      const actualPlayers = await GameDAO(ConnectController).get(
        roomId,
        gameId,
        'player-slots'
      );
      if (
        actualPlayers.length >= maxPlayers &&
        !actualPlayers.map((u) => u.id).includes(userData.id)
      )
        return Errors.socketRoomFull(socket);

      const gameStatus = await GameDAO(ConnectController).get(
        roomId,
        gameId,
        'gameStatus'
      );
      if (
        gameStatus !== GameStatus.NOT_STARTED &&
        !actualPlayers.map((u) => u.id).includes(userData.id)
      )
        return Errors.socketGameAlreadyStarted(socket);

      await GameDAO(ConnectController).enter(roomId, gameId, userData);
      const roomKey = `${roomId}:${gameId}`;
      socket.join(roomKey);
      socket.in(roomKey).emit('entered', userData);
      if (!actualPlayers.map((u) => u.id).includes(userData.id))
        socket.in(roomKey).emit('enterSlot', userData);

      const roomData = await GameDAO(ConnectController).getAllData(
        roomId,
        gameId
      );
      socket.emit('roomData', roomData);
    } catch (err) {
      console.log(err);
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
      const minPlayers = Number(
        await GameDAO(ConnectController).get(roomId, gameId, 'minPlayers')
      );
      const actualPlayers = await GameDAO(ConnectController).get(
        roomId,
        gameId,
        'playersLen'
      );
      if (actualPlayers < minPlayers)
        return Errors.socketGameNoMinimumPlayers(socket);

      await GameDAO(ConnectController).insert(roomId, gameId, {
        gameStatus: GameStatus.ONGOING,
      });
      const roomKey = `${roomId}:${gameId}`;
      socket.in(roomKey).emit('gameStarted');
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  async restart(socket, { roomId, gameId }) {
    try {
      const roomData = await GameDAO(ConnectController).restart(roomId, gameId);
      const roomKey = `${roomId}:${gameId}`;
      socket.in(roomKey).emit('roomData', roomData);
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  async leave(socket, { roomId, gameId }) {
    const userData = SocketHelpers.getUserData(socket);
    try {
      await GameDAO(ConnectController).leave(roomId, gameId, userData);
      const roomKey = `${roomId}:${gameId}`;
      socket.to(roomKey).emit('left', userData);
      socket.leave(roomKey);
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  async quit(socket, { roomId, gameId }) {
    const userData = SocketHelpers.getUserData(socket);
    try {
      await GameDAO(ConnectController).quit(roomId, gameId, userData);
      const roomKey = `${roomId}:${gameId}`;
      socket.to(roomKey).emit('quitted', userData);
      socket.leave(roomKey);
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  async kick(socket, { roomId, gameId, kickedUserData }) {
    //Only host can kick
    const kickerUserData = SocketHelpers.getUserData(socket);
    try {
      const host = await GameDAO.get('host');
      if (host !== kickerUserData.id)
        return Errors.socketUserNotAllowed(socket);
      await GameDAO(ConnectController).quit(roomId, gameId, kickedUserData);
      const roomKey = `${roomId}:${gameId}`;
      socket.in(roomKey).emit('quitted', kickedUserData);
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  ping(socket) {
    socket.emit('pong');
  },
};
