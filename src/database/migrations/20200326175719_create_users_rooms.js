exports.up = function (knex) {
  return knex.schema.createTable('usersRooms', (table) => {
    table.integer('userId').notNullable();
    table.integer('roomId').notNullable();

    table.primary(['userId', 'roomId']);

    table.foreign('userId').references('id').inTable('users');
    table.foreign('roomId').references('id').inTable('rooms');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('usersRooms');
};
