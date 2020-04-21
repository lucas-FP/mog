const express = require('express');

const UserController = require('./route-controllers/UserController');
const RoomController = require('./route-controllers/RoomController');
const SessionController = require('./route-controllers/SessionController');
const GameController = require('./route-controllers/GameController');

const isLogged = require('./middleware/isLogged');

const routes = express.Router();

//Session
routes.post('/login', SessionController.create);
routes.post('/guestlogin', SessionController.createGuest);

// Room
routes.get('/room', RoomController.index);
routes.get('/room/:roomId', RoomController.find);
routes.post('/room', RoomController.create);
routes.delete('/room/:roomId', RoomController.delete);

//User
//TODO check routes
routes.post('/user', UserController.create);

routes.use('/user', isLogged);
routes.get('/user', UserController.index);
routes.get('/user/rooms', UserController.paginateUserRooms);
routes.post('/user/rooms/:roomId', UserController.enterRoom);
routes.delete('/user/rooms/:roomId', UserController.removeUserFromRoom);

routes.get('/games-defaults/:gameCode', GameController.getDefault);

module.exports = routes;
