const userModel = require('../models/userModel');

const userController = {
  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 25;
      const search = req.query.search || '';

      const result = await userModel.getAll(page, limit, search);
      res.json(result);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  getByEmail: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await userModel.getByCitizenEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user by email error:', error);
      res.status(500).json({ error: 'Failed to fetch citizen data' });
    }
  },
};

module.exports = userController;
