const pool = require('../config/database');

const adminModel = {
  findByUsername: async (username) => {
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM admins WHERE username = $1',
      [username]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      'SELECT id, username, email FROM admins WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  create: async (username, email, passwordHash) => {
    const result = await pool.query(
      'INSERT INTO admins (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
    );
    return result.rows[0];
  },
};

module.exports = adminModel;
