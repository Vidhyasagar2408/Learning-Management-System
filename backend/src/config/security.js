const { env } = require('./env');

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = env.CORS_ORIGIN.split(',').map((x) => x.trim()).filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.endsWith('.vercel.app')) return true;
  } catch (_error) {
    return false;
  }

  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
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
