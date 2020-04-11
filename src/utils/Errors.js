module.exports = {
  knex(res, error) {
    return res.status(500).json({
      error: `Database Connection error ${error.code}`,
      details: error.message,
    });
  },
  unauthorized(res) {
    return res.status(403).json({
      error: 'User not allowed to access resource',
    });
  },
  notLogged(res) {
    return res
      .status(401)
      .json({ error: 'You must be logged to perform this action.' });
  },

  socketAlreadyConnected(socket) {
    return socket.emit('customError', { error: 'Already connected to room.' });
  },
  socketUserNotLogged(socket) {
    return socket.emit('customError', { error: 'User not logged.' });
  },
  socketUserNotAllowed(socket) {
    return socket.emit('customError', { error: 'User not allowed.' });
  },
  socketUserNotConnected(socket) {
    return socket.emit('customError', {
      error: 'User not connected to room.',
    });
  },
  socketRoomFull(socket) {
    return socket.emit('customError', {
      error: 'Room full.',
    });
  },
  socketGameAlreadyStarted(socket) {
    return socket.emit('customError', {
      error: 'Game has already started.',
    });
  },

  socketError(socket, error) {
    return socket.emit('customError', {
      error: 'Errorin socket controller.',
      details: error,
    });
  },
};
