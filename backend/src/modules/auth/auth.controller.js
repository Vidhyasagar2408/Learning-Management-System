const { registerSchema, loginSchema } = require('./auth.validator');
const authService = require('./auth.service');
const { refreshCookieOptions } = require('../../config/security');

function sanitizeUser(user) {
  return { id: user.id, email: user.email, name: user.name || user.username || '' };
}

async function register(req, res, next) {
  try {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.status(201).json({ user: sanitizeUser(result.user), accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.json({ user: sanitizeUser(result.user), accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'Missing refresh token' });
    const result = await authService.refresh(token);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    await authService.logout(token);
    res.clearCookie('refreshToken', refreshCookieOptions);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, refresh, logout };
