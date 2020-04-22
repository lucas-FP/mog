# mog

**mog** is a Minimalistic Online Game server. Built with [node.js](https://nodejs.org) and [socket.io](https://socket.io/), mog server can connect players in live multiplayer games.

As of this moment, there is only one game implemented: _Connect_.

## Contributing

If you wish to contribute to the project, a good start would be to look into the todo list below. Notice that some of these items will require changes to [mog ui](https://github.com/lucas-FP/mog-ui).

### Todo List

- Create tests
- Validate data with [joi](https://github.com/hapijs/joi) or similar
- Define the better way to inject GameControllers into GameDAO
- Replace redis promise chains with _multi - exec_ commands
- Turn timer
- Add a new game

### Adding support for a new game

One of the most important things to assure in this project is that new games can be included with minimum adaptation. In order to achieve this, mog uses _Game Controllers_. Game controllers have two main functionalities: Control how the game responds to player actions, and control how data is read and written to the database. Follow the example of existing game controllers and create a new namespace for the game, using the created controller.

The methods a game controller must implement will be listed and documented in the future.
