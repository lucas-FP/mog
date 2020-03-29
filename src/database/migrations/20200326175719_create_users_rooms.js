exports.up = function(knex) {
  return knex.schema.createTable('usersRooms', (table) => {
    table.string('userId').primary();
    table.boolean('roomId').notNullable();

    table.primary(['userId', 'roomId']);

    table
      .foreign('userId')
      .references('id')
      .inTable('users');
    table
      .foreign('roomId')
      .references('id')
      .inTable('room');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('usersRooms');
};
