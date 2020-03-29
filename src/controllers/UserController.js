const crypto = require('crypto');
const bcrypt = require('bcrypt');
const KnexError = require('../utils/errors/KnexError');
const UserDAO = require('../dao/UserDAO');

module.exports = {
  async index(_req, res) {
    try {
      const users = await UserDAO.index();
      return res.json(users);
    } catch (err) {
      return KnexError.create(res, err);
    }
  },

  async create(req, res) {
    const { nick, isGuest, userName, password } = req.body;

    const id = crypto.randomBytes(4).toString('HEX');

    bcrypt.hash(password, 10, async (err, hash) => {
      if (!err) {
        try {
          await UserDAO.create(id, nick, isGuest, userName, hash);
          req.session.userId = id;
          return res.json({ id });
        } catch (err) {
          KnexError.create(res, err);
        }
      } else return res.status(500).json({ error: 'Encryption error' });
    });
  }
};
