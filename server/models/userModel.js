const pool = require('../config/database');

const userModel = {
  getAll: async (page = 1, limit = 25, search = '') => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT
        citizen_name,
        citizen_email,
        citizen_phone,
        COUNT(*) as total_complaints,
        MAX(created_at) as last_complaint_date
      FROM complaints
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (citizen_name ILIKE $${paramCount} OR citizen_email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` GROUP BY citizen_email, citizen_name, citizen_phone
               ORDER BY citizen_name`;

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT citizen_email) as count
      FROM complaints
      WHERE 1=1
    `;
    let countParams = [];
    if (search) {
      countQuery += ` AND (citizen_name ILIKE $1 OR citizen_email ILIKE $1)`;
      countParams = [`%${search}%`];
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return {
      users: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  getByCitizenEmail: async (email) => {
    const result = await pool.query(
      `SELECT
        citizen_name,
        citizen_email,
        citizen_phone,
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
      FROM complaints
      WHERE citizen_email = $1
      GROUP BY citizen_email, citizen_name, citizen_phone`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const citizenInfo = result.rows[0];

    const complaintsResult = await pool.query(
      `SELECT id, title, department_id, status, created_at
       FROM complaints
       WHERE citizen_email = $1
       ORDER BY created_at DESC`,
      [email]
    );

    return {
      citizen_name: citizenInfo.citizen_name,
      citizen_email: citizenInfo.citizen_email,
      citizen_phone: citizenInfo.citizen_phone,
      total_complaints: parseInt(citizenInfo.total_complaints),
      status_breakdown: {
        pending: parseInt(citizenInfo.pending_count) || 0,
        in_progress: parseInt(citizenInfo.in_progress_count) || 0,
        resolved: parseInt(citizenInfo.resolved_count) || 0,
        rejected: parseInt(citizenInfo.rejected_count) || 0,
      },
      complaints: complaintsResult.rows,
    };
  },
};

module.exports = userModel;
