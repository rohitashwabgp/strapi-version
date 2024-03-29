module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'version_manager'),
      user: env('DATABASE_USERNAME', 'rkumar'),
      password: env('DATABASE_PASSWORD', 'Qwerty@123'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
