const UserDAO = require('../dao/UserDAO');
const RoomDAO = require('../dao/RoomDAO');
const Errors = require('../utils/Errors');

module.exports = {
  async enter(socket, { roomId }) {
    const userData = {
      id: socket.handshake.session.userId,
      userName: socket.handshake.session.userName,
      nick: socket.handshake.session.nick,
    };
    if (!userData.id)
      return socket.emit('customError', Errors.socketUserNotLogged);
    const userList = (await UserDAO.getConnctedUsers(roomId)).map((i) =>
      Number(i)
    );
    if (userList.includes(userData.id))
      return socket.emit('customError', Errors.socketAlreadyConnected);

    const user = await UserDAO.findUserInRoom(userData.id, roomId);
    if (!user) return socket.emit('customError', Errors.socketAlreadyConnected);

    socket.join(roomId);
    await UserDAO.connectUserInRoom(userData.id, roomId);
    socket.in(roomId).emit('entered', userData);
  },

  async pushMessage(socket, { roomId, message }) {
    const userData = {
      id: socket.handshake.session.userId,
      userName: socket.handshake.session.userName,
      nick: socket.handshake.session.nick,
    };
    if (!userData.id)
      return socket.emit('customError', Errors.socketUserNotLogged);

    //TODO find out if this check is needed
    const userList = (await UserDAO.getConnctedUsers(roomId)).map((i) =>
      Number(i)
    );
    if (!userList.includes(userData.id))
      return socket.emit('customError', Errors.socketUserNotConnected);

    await RoomDAO.pushMessage(roomId, message);

    socket.in(roomId).emit('messagePushed', message);
  },

  leave(socket) {
    const rooms = Object.keys(socket.rooms);
    const userData = {
      id: socket.handshake.session.userId,
      userName: socket.handshake.session.userName,
      nick: socket.handshake.session.nick,
    };
    console.log(userData);
    console.log('leaving');
    rooms.forEach((r) => socket.in(r).emit('left', userData));
    socket.in('1').emit('left', userData);
  },
};
