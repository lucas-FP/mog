const UserDAO = require('../dao/UserDAO');
const KnexError = require('../utils/errors/KnexError');
const bcrypt = require('bcrypt');

module.exports = {
  async create(req, res) {
    const { userName, password } = req.body;
    try {
      const storedUser = await UserDAO.findByName(userName);
      bcrypt.compare(password, storedUser.password, (err, response) => {
        if (!err) {
          if (response) {
            req.session.userId = storedUser.id;
            return res.status(204).send();
          } else {
            return res.status(400).json({ error: 'Wrong password' });
          }
        } else {
          return res.status(500).json({ error: 'Encryption error' });
        }
      });
    } catch (err) {
      return KnexError.create(res, err);
    }
  }
};
