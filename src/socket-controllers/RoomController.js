const UserDAO = require('../dao/UserDAO');
const RoomDAO = require('../dao/RoomDAO');
const RoomConnectionDAO = require('../dao/RoomConnectionDAO');
const Errors = require('../utils/Errors');
const SocketHelpers = require('../utils/SocketHelpers');

module.exports = {
  async enter(socket, { roomId }) {
    const userData = SocketHelpers.getUserData(socket);
    //TODO break into smaller blocks
    try {
      //Check if user can really enterr the room
      //Is logged?
      if (!userData.id) return Errors.socketUserNotLogged(socket);

      const userList = (
        await RoomConnectionDAO.getConnectedUsers(roomId)
      ).map((u) => Number(u.id));
      //Is room full?
      const roomData = await RoomDAO.find(roomId);
      if (roomData.maxPlayers <= userList.length)
        return Errors.socketRoomFull(socket);

      //Is not already in room?
      if (userList.includes(userData.id)) return;

      //Is user allowed in room?
      const [userCheck, hostCheck] = await UserDAO.findUserInRoom(
        userData.id,
        roomId
      );
      if (!userCheck && !hostCheck) return Errors.socketUserNotAllowed(socket);

      socket.join(roomId);
      await RoomConnectionDAO.connectUserInRoom(userData, roomId);
      console.log('pre get data');
      const connectionData = await RoomConnectionDAO.getRoomData(roomId);
      socket.to(roomId).emit('entered', userData);
      // console.log('emitting room data');
      socket.emit('roomData', connectionData);
    } catch (err) {
      console.log(err);
      return Errors.socketError(socket, err);
    }
  },

  async pushMessage(socket, { roomId, message }) {
    console.log('here');
    const userData = SocketHelpers.getUserData(socket);
    if (!userData.id) return Errors.socketUserNotLogged(socket);
    //TODO find out if this check is needed
    const userList = (
      await RoomConnectionDAO.getConnectedUsers(roomId)
    ).map((u) => Number(u.id));
    if (!userList.includes(userData.id))
      return Errors.socketUserNotConnected(socket);

    await RoomConnectionDAO.pushMessage(roomId, { userData, message });
    socket.in(roomId).emit('messagePushed', { userData, message });
  },

  async pushGame(socket, { roomId, gameCode, gameConfig }) {
    const userData = SocketHelpers.getUserData(socket);
    if (!userData.id) return Errors.socketUserNotLogged(socket);
    //TODO find out if this check is needed
    const userList = (
      await RoomConnectionDAO.getConnectedUsers(roomId)
    ).map((u) => Number(u.id));
    if (!userList.includes(userData.id))
      return Errors.socketUserNotConnected(socket);

    const gameId = await RoomConnectionDAO.pushGame(roomId, userData.id, {
      gameCode,
      gameConfig,
    });
    socket
      .in(roomId)
      .emit('gamePushed', { id: gameId, code: gameCode, config: gameConfig });
  },

  async leave(socket, { roomId }) {
    const userData = SocketHelpers.getUserData(socket);
    await RoomConnectionDAO.disconnectUserFromRooom(userData, roomId);
    socket.in(roomId).emit('left', userData);
    socket.leave(roomId);
  },
};
