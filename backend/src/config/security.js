const { env } = require('./env');

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = env.CORS_ORIGIN.split(',').map((x) => x.trim()).filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools with no Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000
};

if (env.COOKIE_DOMAIN && env.COOKIE_DOMAIN !== 'localhost') {
  refreshCookieOptions.domain = env.COOKIE_DOMAIN;
}

module.exports = { corsOptions, refreshCookieOptions };
