const departmentModel = require('../models/departmentModel');

const departmentController = {
  create: async (req, res) => {
    try {
      const { name, description, is_active } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const exists = await departmentModel.checkNameExists(name);
      if (exists) {
        return res.status(400).json({ error: 'Department name already exists' });
      }

      const department = await departmentModel.create(name, description, is_active !== false);
      res.status(201).json(department);
    } catch (error) {
      console.error('Create department error:', error);
      res.status(500).json({ error: 'Failed to create department' });
    }
  },

  getAll: async (req, res) => {
    try {
      const departments = await departmentModel.getAll();
      res.json({ departments });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const existing = await departmentModel.getById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Department not found' });
      }

      if (name && name !== existing.name) {
        const exists = await departmentModel.checkNameExists(name, id);
        if (exists) {
          return res.status(400).json({ error: 'Department name already exists' });
        }
      }

      const department = await departmentModel.update(
        id,
        name || existing.name,
        description !== undefined ? description : existing.description,
        is_active !== undefined ? is_active : existing.is_active
      );

      res.json(department);
    } catch (error) {
      console.error('Update department error:', error);
      res.status(500).json({ error: 'Failed to update department' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const existing = await departmentModel.getById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Department not found' });
      }

      try {
        await departmentModel.delete(id);
        res.json({ message: 'Department deleted' });
      } catch (error) {
        if (error.message.includes('Cannot delete')) {
          return res.status(409).json({ error: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  },
};

module.exports = departmentController;
