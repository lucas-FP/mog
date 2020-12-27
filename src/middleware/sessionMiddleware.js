const redisClient = require('../database/RedisConnection').redisClient;
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const sessTime = 8 * 60 * 60 * 1000;

module.exports = session({
  store: new RedisStore({ client: redisClient, ttl: sessTime }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  // rolling: true,
  cookie: {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV == 'production' ? true : false,
    maxAge: sessTime,
    sameSite: 'none',
  },
});
