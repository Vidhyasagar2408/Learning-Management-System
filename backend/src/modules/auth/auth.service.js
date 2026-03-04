const { db } = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../../utils/jwt');
const { findUserByEmail, createUser, findUserById } = require('../users/user.model');

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function issueTokensForUser(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  await db('refresh_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: addDays(30)
  });

  return { accessToken, refreshToken };
}

async function register({ email, password, name }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const user = await createUser({ email, password_hash, name });
  const tokens = await issueTokensForUser(user);
  return { user, ...tokens };
}

async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const tokens = await issueTokensForUser(user);
  return { user, ...tokens };
}

async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    const err = new Error('Invalid refresh token');
    err.status = 401;
    throw err;
  }

  const tokenHash = hashToken(refreshToken);
  const tokenRow = await db('refresh_tokens')
    .where({ user_id: Number(payload.sub), token_hash: tokenHash })
    .whereNull('revoked_at')
    .first();

  if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
    const err = new Error('Refresh token expired or revoked');
    err.status = 401;
    throw err;
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    const err = new Error('User not found');
    err.status = 401;
    throw err;
  }

  const accessToken = signAccessToken(user);
  return { accessToken };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    await db('refresh_tokens')
      .where({ user_id: Number(payload.sub), token_hash: tokenHash })
      .update({ revoked_at: new Date() });
  } catch (_error) {
  }
}

module.exports = { register, login, refresh, logout };