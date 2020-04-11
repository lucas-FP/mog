const RoomConnectionDAO = require('../dao/RoomConnectionDAO');
const GameDAO = require('../dao/GameDAO');
const SocketHelpers = require('../utils/SocketHelpers');

module.exports = {
  handleDisconnection(socket) {
    const rooms = Object.keys(socket.rooms);
    const userData = SocketHelpers.getUserData(socket);
    rooms.forEach((r) => {
      const roomData = r.split(':');
      const roomId = roomData[0];
      const gameId = roomData.length > 1 ? roomData[1] : roomData[0];
      socket.in(r).emit('left', userData);
      if (gameId) GameDAO.leave(roomId, gameId, userData.id);
      else RoomConnectionDAO.disconnectUserFromRooom(userData.id, r);
    });
  },
};
