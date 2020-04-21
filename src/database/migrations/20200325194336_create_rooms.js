exports.up = function (knex) {
  return knex.schema.createTable('rooms', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.integer('hostId').notNullable();
    table.integer('maxPlayers').notNullable();
    table.boolean('isPublic').notNullable();
    table.string('password');
    table.foreign('hostId').references('id').inTable('users');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('rooms');
};
