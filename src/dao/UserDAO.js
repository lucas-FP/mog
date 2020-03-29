const connection = require('../database/connection');

module.exports = {
  async index() {
    return connection('users').select('*');
  },

  async find(id) {
    return connection('users')
      .where('id', id)
      .select('*')
      .first();
  },

  async findByName(userName) {
    return connection('users')
      .where('userName', userName)
      .select('*')
      .first();
  },

  async create(id, nick, isGuest, userName, password) {
    return connection('users').insert({
      id,
      nick,
      isGuest,
      userName,
      password
    });
  }
};
