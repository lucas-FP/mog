exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.boolean('isGuest').notNullable();
    table.string('nick').notNullable();
    table.string('userName').unique();
    table.string('password');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
