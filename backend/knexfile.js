const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const useSsl = process.env.DB_SSL === 'true';
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: useSsl ? { rejectUnauthorized } : undefined
  },
  migrations: {
    directory: path.join(__dirname, 'src/migrations')
  }
};