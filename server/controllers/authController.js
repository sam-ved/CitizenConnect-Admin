const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');
const jwtConfig = require('../config/jwt');

const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const admin = await adminModel.findByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { admin_id: admin.id, username: admin.username },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiryTime }
      );

      res.json({ token, admin_id: admin.id, username: admin.username });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  logout: (req, res) => {
    res.json({ message: 'Logged out successfully' });
  },
};

module.exports = authController;
