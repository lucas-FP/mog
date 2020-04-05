const Errors = require('../utils/Errors');

function userAuth(req, res, next) {
  const sessId = req.session.userId;
  const { userId } = req.params;
  if (sessId === parseInt(userId)) next();
  else return Errors.unauthorized(res);
}

module.exports = userAuth;
