const Errors = require('../utils/errors');

function userAuth(req, res, next) {
  const sessId = req.session.userId;
  const { userId } = req.params;
  console.log(userId, sessId);
  if (sessId === parseInt(userId)) next();
  else return Errors.unauthorized(res);
}

module.exports = userAuth;
