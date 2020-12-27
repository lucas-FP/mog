const RoomController = require('./socket-controllers/RoomController');
const GameController = require('./socket-controllers/GameController');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const sharedSession = require('express-socket.io-session');
const { processAction } = require('./game-controllers/ConnectController');

module.exports = function sockets(io) {
  //Rooms Socket
  const roomsSocket = io.of('/rooms');
  roomsSocket.use(
    sharedSession(sessionMiddleware, {
      autoSave: true,
    })
  );

  roomsSocket.on('connection', socket => {
    socket.on('enter', data => RoomController.enter(socket, data));

    socket.on('pushMessage', data => RoomController.pushMessage(socket, data));

    socket.on('pushGame', data => RoomController.pushGame(socket, data));

    socket.on('leave', data => RoomController.leave(socket, data));

    socket.on('error', err => console.log(err));
  });

  //Game Socket
  const connectSocket = io.of('/connect');
  connectSocket.use(
    sharedSession(sessionMiddleware, {
      autoSave: true,
    })
  );

  connectSocket.on('connection', socket => {
    socket.on('enter', data => GameController.enter(socket, data));

    socket.on('leave', data => GameController.leave(socket, data));

    socket.on('quit', data => GameController.quit(socket, data));

    socket.on('kick', data => GameController.kick(socket, data));

    socket.on('ping', data => GameController.ping(socket, data));

    socket.on('pushAction', data =>
      GameController.control(socket, data, processAction)
    );

    socket.on('startGame', data => GameController.start(socket, data));

    socket.on('restartGame', data => GameController.restart(socket, data));

    socket.on('error', err => console.log(err));
  });
};
