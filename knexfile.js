// Update with your config settings.

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      user: 'gmroomuser',
      password: 'gmpass',
      database: 'gmroomdb',
    },
    migrations: {
      directory: './src/database/migrations',
    },
    useNullAsDefault: true,
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/database/migrations',
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/database/migrations',
    },
    useNullAsDefault: true,
  },
};
