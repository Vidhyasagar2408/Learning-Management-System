const { env } = require('./env');

const isProd = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: env.CORS_ORIGIN,
  credentials: true
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  domain: env.COOKIE_DOMAIN,
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000
};

module.exports = { corsOptions, refreshCookieOptions };