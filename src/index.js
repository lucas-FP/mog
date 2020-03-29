const express = require('express');
const routes = require('./routes');

const redis = require('redis');
const session = require('express-session');

let RedisStore = require('connect-redis')(session);
let redisClient = redis.createClient();

const sessTime = 5 * 60 * 1000;

const app = express();

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient, ttl: sessTime }),
    secret: '4e132f45b2b3d5df',
    resave: false,
    saveUninitialized: true,
    rolling: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: sessTime }
  })
);

app.use(routes);

app.listen(3333);
