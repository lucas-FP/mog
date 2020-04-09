const RoomController = require('./socket-controllers/RoomController');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const sharedsession = require('express-socket.io-session');

module.exports = function sockets(io) {
  //Rooms Socket
  const roomsSocket = io.of('/rooms');
  roomsSocket.use(
    sharedsession(sessionMiddleware, {
      autoSave: true,
    })
  );

  roomsSocket.on('connection', (socket) => {
    socket.on('enter', (data) => RoomController.enter(socket, data));

    socket.on('pushMessage', (data) =>
      RoomController.pushMessage(socket, data)
    );

    socket.on('disconnecting', () => RoomController.leave(socket));

    socket.on('error', (err) => console.log(err));
  });

  //Game Socket
};
