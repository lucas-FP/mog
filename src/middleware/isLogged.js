const Errors = require('../utils/Errors');

function isLogged(req, res, next) {
  const sessId = req.session.userId;
  if (sessId) next();
  else return Errors.notLogged(res);
}

module.exports = isLogged;
