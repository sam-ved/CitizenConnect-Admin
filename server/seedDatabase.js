const pool = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Admins table created');

    // Create departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Departments table created');

    // Create complaints table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        department_id UUID NOT NULL REFERENCES departments(id),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
        citizen_name VARCHAR(255) NOT NULL,
        citizen_email VARCHAR(255) NOT NULL,
        citizen_phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      );
    `);
    console.log('✓ Complaints table created');

    // Check if admin already exists
    const adminCheck = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [process.env.ADMIN_USERNAME]
    );

    if (adminCheck.rows.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await pool.query(
        'INSERT INTO admins (username, email, password_hash) VALUES ($1, $2, $3)',
        [process.env.ADMIN_USERNAME, `${process.env.ADMIN_USERNAME}@citizenconnect.local`, hashedPassword]
      );
      console.log('✓ Admin user created');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Check if departments exist
    const deptCheck = await pool.query('SELECT COUNT(*) FROM departments');
    if (parseInt(deptCheck.rows[0].count) === 0) {
      // Seed initial departments
      const departments = ['Water', 'Roads', 'Electricity', 'Sanitation'];
      for (const dept of departments) {
        await pool.query(
          'INSERT INTO departments (name, description, is_active) VALUES ($1, $2, $3)',
          [dept, `${dept} department issues`, true]
        );
      }
      console.log('✓ Initial departments seeded');
    } else {
      console.log('✓ Departments already exist');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
