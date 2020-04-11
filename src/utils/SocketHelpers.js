module.exports = {
  getUserData(socket) {
    const session = socket && socket.handshake && socket.handshake.session;

    return session
      ? {
          id: session.userId,
          userName: session.userName,
          nick: session.nick,
        }
      : { id: null, userName: null, nick: null };
  },
};
