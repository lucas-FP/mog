const UserDAO = require('../dao/UserDAO');
const Errors = require('../utils/Errors');
const bcrypt = require('bcrypt');

module.exports = {
  async create(req, res) {
    const { userName, password } = req.body;
    try {
      const storedUser = await UserDAO.findByName(userName);
      if (!storedUser || !storedUser.id)
        return res.status(404).json({ error: 'User not found' });

      bcrypt.compare(password, storedUser.password, (err, response) => {
        if (!err) {
          if (response) {
            req.session.userId = storedUser.id;
            req.session.userName = storedUser.userName;
            req.session.userNick = storedUser.nick;
            return res.status(204).send();
          } else {
            return res.status(400).json({ error: 'Wrong password' });
          }
        } else {
          return res.status(500).json({ error: 'Encryption error' });
        }
      });
    } catch (err) {
      return Errors.knex(res, err);
    }
  },

  async createGuest(req, res) {
    const { nick } = req.body;
    try {
      const [{ id }] = await UserDAO.create(nick, true, null, null);
      req.session.userId = { id };
      req.session.userName = null;
      req.session.userNick = nick;
      return res.status(204).send();
    } catch (err) {
      return Errors.knex(res, err);
    }
  },
};
