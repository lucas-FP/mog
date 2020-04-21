const express = require('express');
const routes = require('./routes');
const app = require('express')();
const cors = require('cors');

const http = require('http').createServer(app);
const io = require('socket.io')(http);

let port = process.env.PORT;
if (port == null || port == '') {
  port = 3333;
}
app.listen(port);

const sessionMiddleware = require('./middleware/sessionMiddleware');

//TODO setup enviroment variables

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(express.json());

app.use(sessionMiddleware);

app.use(routes);

//Loads sockets
require('./sockets')(io);

http.listen(3333);
