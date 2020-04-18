module.exports = {
  getUserData(socket) {
    const session = socket && socket.handshake && socket.handshake.session;

    return session
      ? {
          id: session.userId,
          userName: session.userName,
          nick: session.userNick,
        }
      : { id: null, userName: null, nick: null };
  },

  stringifyUserData(data) {
    return JSON.stringify(data, ['id', 'userName', 'nick']);
  },

  parseUserData(dataString) {
    return JSON.parse(dataString);
  },
};
