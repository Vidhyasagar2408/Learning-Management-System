const { db } = require('../../config/db');

let userColumnsCache = null;

async function getUsersTableColumns() {
  if (userColumnsCache) return userColumnsCache;
  const rows = await db('information_schema.columns')
    .where({
      table_schema: db.client.database(),
      table_name: 'users'
    })
    .select('column_name');
  userColumnsCache = new Set(rows.map((r) => r.column_name));
  return userColumnsCache;
}

async function makeUniqueUsername(baseName) {
  const seed = String(baseName || 'user').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'user';
  let candidate = seed;
  let suffix = 0;

  while (true) {
    const existing = await db('users').where({ username: candidate }).first();
    if (!existing) return candidate;
    suffix += 1;
    candidate = `${seed}_${suffix}`;
  }
}

async function findUserByEmail(email) {
  return db('users').where({ email }).first();
}

async function findUserById(id) {
  return db('users').where({ id }).first();
}

async function createUser({ email, password_hash, name }) {
  const columns = await getUsersTableColumns();
  const payload = { email, password_hash };

  if (columns.has('name')) {
    payload.name = name;
  }
  if (columns.has('username')) {
    payload.username = await makeUniqueUsername(name);
  }
  if (columns.has('phone')) {
    payload.phone = '0000000000';
  }
  if (columns.has('phone_number')) {
    payload.phone_number = '';
  }

  const [id] = await db('users').insert(payload);
  return findUserById(id);
}

module.exports = { findUserByEmail, findUserById, createUser };
