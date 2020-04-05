const express = require('express');

const UserController = require('./controllers/UserController');
const RoomController = require('./controllers/RoomController');
const SessionController = require('./controllers/SessionController');
const ConnectController = require('./controllers/ConnectController');

const userAuth = require('./middleware/userAuth');
const isLogged = require('./middleware/isLogged');
const isInRoom = require('./middleware/isInRoom');

const routes = express.Router();

//Session
routes.post('/login', SessionController.create);

// Room
routes.get('/room', RoomController.index);
routes.get('/room/:roomId', RoomController.find);
routes.post('/room', RoomController.create);
routes.delete('/room/:roomId', RoomController.delete);

//User
//TODO check routes
routes.use('/user/:userId', userAuth);

routes.get('/user', UserController.index);
routes.post('/user', UserController.create);
routes.get('/user/:userId/rooms', UserController.paginateUserRooms);
routes.post('/user/:userId/rooms', UserController.create);
routes.delete('/user/:userId/rooms/:roomId', UserController.removeUserFromRoom);

//Games
routes.use('/room/:roomId/game', isLogged, isInRoom);

routes.post('/room/:roomId/game', ConnectController.create);

module.exports = routes;
