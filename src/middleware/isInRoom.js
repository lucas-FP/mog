const Errors = require('../utils/Errors');
const UserDAO = require('../dao/UserDAO');

async function isInRoom(req, res, next) {
  const sessId = req.session.userId;
  const { roomId } = req.params;
  try {
    const [check, hostCheck] = await UserDAO.findUserInRoom(sessId, roomId);
    if (check || hostCheck) next();
    else return Errors.unauthorized(res);
  } catch (err) {
    return Errors.knex(res, err);
  }
}

module.exports = isInRoom;
