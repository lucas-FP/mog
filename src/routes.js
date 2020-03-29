const express = require('express');

const UserController = require('./controllers/UserController');
const UserRoomsController = require('./controllers/UserRoomsController');
const RoomController = require('./controllers/RoomController');
const SessionController = require('./controllers/SessionController');

const routes = express.Router();

// Room
routes.get('/room', RoomController.index);
routes.get('/room/:id', RoomController.find);
routes.post('/room', RoomController.create);
routes.delete('/room/:id', RoomController.delete);

//User
routes.get('/user', UserController.index);
routes.post('/user', UserController.create);

//Profile
routes.get('/user-rooms', UserRoomsController.index);
routes.post('/user-rooms', UserRoomsController.create);
routes.delete('/user-rooms', UserRoomsController.delete);

//Session
routes.post('/login', SessionController.create);

module.exports = routes;
