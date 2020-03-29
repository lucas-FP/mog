exports.up = function(knex) {
  return knex.schema.createTable('rooms', (table) => {
    table.string('id').primary();
    table.string('hostId').notNullable();
    table.int('maxPlayers').notNullable();
    table.int('initialLives').notNullable();
    table.int('deckSize').notNullable();
    table.boolean('isPublic').notNullable();
    table.string('password');
    table.int('turnTimeout');
    table.int('livesPerPlayer');
    table.boolean('incrementalTimeout');
    table
      .foreign('hostId')
      .references('id')
      .inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('rooms');
};
