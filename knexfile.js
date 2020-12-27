// Update with your config settings.
require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    migrations: {
      directory: './src/database/migrations',
    },
    useNullAsDefault: true,
  },
  production: {
    client: 'postgresql',
    connection: process.env.POSTGRES_URL,
    migrations: {
      directory: './src/database/migrations',
    },
    useNullAsDefault: true,
  },
};
