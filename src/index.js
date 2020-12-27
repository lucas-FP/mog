require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const app = require('express')();
const cors = require('cors');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

let port = process.env.NODE_PORT;
if (port == null || port == '') {
  port = 3333;
}

const sessionMiddleware = require('./middleware/sessionMiddleware');

//TODO setup environment variables

app.use(
  cors({
    origin: process.env.FRONTEND_HOST,
    credentials: true,
  })
);

app.use(express.json());

app.use(sessionMiddleware);

app.use(routes);

//Loads sockets
require('./sockets')(io);

http.listen(port);
console.log(`server started on port ${port}`);
