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
      //Is not already in room?
      const userList = (
        await RoomConnectionDAO.getConnctedUsers(roomId)
      ).map((i) => Number(i));
      const roomData = await RoomDAO.find(roomId);
      if (roomData.maxPlayers <= userList.length)
        return Errors.socketRoomFull(socket);
      if (userList.includes(userData.id))
        return Errors.socketAlreadyConnected(socket);
      //Is user allowed in room?
      const [userCheck, hostCheck] = await UserDAO.findUserInRoom(
        userData.id,
        roomId
      );
      if (!userCheck && !hostCheck) return Errors.socketUserNotAllowed(socket);

      socket.join(roomId);
      await RoomConnectionDAO.connectUserInRoom(userData.id, roomId);
      const connectionData = await RoomConnectionDAO.getRoomData(roomId);
      socket.in(roomId).emit('entered', userData);
      socket.emit('roomData', { connectionData });
    } catch (err) {
      return Errors.socketError(socket, err);
    }
  },

  async pushMessage(socket, { roomId, message }) {
    const userData = SocketHelpers.getUserData(socket);
    if (!userData.id) return Errors.socketUserNotLogged(socket);

    //TODO find out if this check is needed
    const userList = (
      await RoomConnectionDAO.getConnctedUsers(roomId)
    ).map((i) => Number(i));
    if (!userList.includes(userData.id))
      return Errors.socketUserNotConnected(socket);

    await RoomConnectionDAO.pushMessage(roomId, message);
    socket.in(roomId).emit('messagePushed', message);
  },

  async leave(socket, { roomId }) {
    const userData = SocketHelpers.getUserData(socket);
    await RoomConnectionDAO.disconnectUserFromRooom(userData.id, roomId);
    socket.in(roomId).emit('left', userData);
    socket.leave(roomId);
  },
};
