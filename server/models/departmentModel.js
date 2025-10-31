const pool = require('../config/database');

const departmentModel = {
  create: async (name, description, isActive = true) => {
    const result = await pool.query(
      `INSERT INTO departments (name, description, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, isActive]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await pool.query(`
      SELECT d.*, COUNT(c.id) as complaint_count
      FROM departments d
      LEFT JOIN complaints c ON d.id = c.department_id
      GROUP BY d.id
      ORDER BY d.name
    `);
    return result.rows;
  },

  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM departments WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  update: async (id, name, description, isActive) => {
    const result = await pool.query(
      `UPDATE departments
       SET name = $1, description = $2, is_active = $3
       WHERE id = $4
       RETURNING *`,
      [name, description, isActive, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    // Check if department has complaints
    const checkResult = await pool.query(
      'SELECT COUNT(*) FROM complaints WHERE department_id = $1',
      [id]
    );

    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete department with active complaints');
    }

    const result = await pool.query(
      'DELETE FROM departments WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  getActive: async () => {
    const result = await pool.query(
      'SELECT * FROM departments WHERE is_active = true ORDER BY name'
    );
    return result.rows;
  },

  checkNameExists: async (name, excludeId = null) => {
    const result = await pool.query(
      excludeId
        ? 'SELECT COUNT(*) FROM departments WHERE name = $1 AND id != $2'
        : 'SELECT COUNT(*) FROM departments WHERE name = $1',
      excludeId ? [name, excludeId] : [name]
    );
    return parseInt(result.rows[0].count) > 0;
  },
};

module.exports = departmentModel;
