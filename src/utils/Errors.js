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

  socketAlreadyConnected: {
    error: 'Already connected to room.',
  },

  socketUserNotLogged: {
    error: 'User not logged.',
  },

  socketUserNotAllowed: {
    error: 'User not allowed.',
  },

  socketUserNotConnected: {
    error: 'User not connected to room.',
  },
};
