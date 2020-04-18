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
    return socket.emit('customError', {
      error: 'User not logged.',
      status: 401,
    });
  },
  socketUserNotAllowed(socket) {
    return socket.emit('customError', {
      error: 'User not allowed.',
      status: 403,
    });
  },
  socketUserNotConnected(socket) {
    return socket.emit('customError', {
      error: 'User not connected to room.',
      status: 401,
    });
  },
  socketRoomFull(socket) {
    return socket.emit('customError', {
      error: 'Room full.',
      status: 409,
    });
  },
  socketGameAlreadyStarted(socket) {
    return socket.emit('customError', {
      error: 'Game has already started.',
      status: 409,
    });
  },

  socketError(socket, error) {
    return socket.emit('customError', {
      error: 'Error in socket controller.',
      details: error,
      status: 500,
    });
  },
};
