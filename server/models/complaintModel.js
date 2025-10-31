const pool = require('../config/database');

const complaintModel = {
  create: async (title, description, departmentId, citizenName, citizenEmail, citizenPhone) => {
    const result = await pool.query(
      `INSERT INTO complaints (title, description, department_id, citizen_name, citizen_email, citizen_phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, departmentId, citizenName, citizenEmail, citizenPhone]
    );
    return result.rows[0];
  },

  getById: async (id) => {
    const result = await pool.query(
      'SELECT * FROM complaints WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  getAll: async (page = 1, limit = 20, filters = {}) => {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM complaints WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.department_id) {
      query += ` AND department_id = $${paramCount}`;
      params.push(filters.department_id);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (citizen_name ILIKE $${paramCount} OR citizen_email ILIKE $${paramCount} OR title ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.fromDate && filters.toDate) {
      query += ` AND created_at >= $${paramCount} AND created_at <= $${paramCount + 1}`;
      params.push(filters.fromDate, filters.toDate);
      paramCount += 2;
    }

    query += ' ORDER BY created_at DESC';

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return {
      complaints: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  update: async (id, title, description, departmentId, status, citizenName, citizenEmail, citizenPhone) => {
    let query = `
      UPDATE complaints
      SET title = $1, description = $2, department_id = $3, status = $4,
          citizen_name = $5, citizen_email = $6, citizen_phone = $7,
          updated_at = CURRENT_TIMESTAMP
    `;
    const params = [title, description, departmentId, status, citizenName, citizenEmail, citizenPhone];

    if (status === 'resolved') {
      query += ', resolved_at = CURRENT_TIMESTAMP';
    } else {
      query += ', resolved_at = NULL';
    }

    query += ' WHERE id = $8 RETURNING *';
    params.push(id);

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM complaints WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  },

  getStatistics: async () => {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM complaints
    `);
    return result.rows[0];
  },

  getDepartmentStats: async () => {
    const result = await pool.query(`
      SELECT d.name as department_name, COUNT(c.id) as complaint_count
      FROM departments d
      LEFT JOIN complaints c ON d.id = c.department_id
      WHERE d.is_active = true
      GROUP BY d.id, d.name
      ORDER BY d.name
    `);
    return result.rows;
  },
};

module.exports = complaintModel;
