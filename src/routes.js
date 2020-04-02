const express = require('express');

const UserController = require('./controllers/UserController');
const RoomController = require('./controllers/RoomController');
const SessionController = require('./controllers/SessionController');

const userAuth = require('./middleware/user-auth');

const routes = express.Router();

routes.use('/user/:userId', userAuth);

// Room
routes.get('/room', RoomController.index);
routes.get('/room/:roomId', RoomController.find);
routes.post('/room', RoomController.create);
routes.delete('/room/:roomId', RoomController.delete);

//User
routes.get('/user', UserController.index);
routes.post('/user', UserController.create);
routes.get('/user/:userId/rooms', UserController.paginateUserRooms);
routes.post('/user/:userId/rooms', UserController.create);
routes.delete('/user/:userId/rooms/:roomId', UserController.removeUserFromRoom);

//Session
routes.post('/login', SessionController.create);

module.exports = routes;
