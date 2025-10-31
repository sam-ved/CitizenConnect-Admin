const complaintModel = require('../models/complaintModel');
const departmentModel = require('../models/departmentModel');

const complaintController = {
  create: async (req, res) => {
    try {
      const { title, description, department_id, citizen_name, citizen_email, citizen_phone } = req.body;

      if (!title || !description || !department_id || !citizen_name || !citizen_email || !citizen_phone) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const complaint = await complaintModel.create(
        title,
        description,
        department_id,
        citizen_name,
        citizen_email,
        citizen_phone
      );

      res.status(201).json(complaint);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ error: 'Failed to create complaint' });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const complaint = await complaintModel.getById(id);

      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      console.error('Get complaint error:', error);
      res.status(500).json({ error: 'Failed to fetch complaint' });
    }
  },

  getAll: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const filters = {
        department_id: req.query.department,
        status: req.query.status,
        search: req.query.search,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
      };

      const result = await complaintModel.getAll(page, limit, filters);
      res.json(result);
    } catch (error) {
      console.error('Get complaints error:', error);
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, department_id, status, citizen_name, citizen_email, citizen_phone } = req.body;

      const existing = await complaintModel.getById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const updated = await complaintModel.update(
        id,
        title || existing.title,
        description || existing.description,
        department_id || existing.department_id,
        status || existing.status,
        citizen_name || existing.citizen_name,
        citizen_email || existing.citizen_email,
        citizen_phone || existing.citizen_phone
      );

      res.json(updated);
    } catch (error) {
      console.error('Update complaint error:', error);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await complaintModel.getById(id);

      if (!existing) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      await complaintModel.delete(id);
      res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
      console.error('Delete complaint error:', error);
      res.status(500).json({ error: 'Failed to delete complaint' });
    }
  },

  getStats: async (req, res) => {
    try {
      const stats = await complaintModel.getStatistics();
      const deptStats = await complaintModel.getDepartmentStats();

      res.json({
        total_complaints: parseInt(stats.total_complaints) || 0,
        pending_count: parseInt(stats.pending_count) || 0,
        resolved_count: parseInt(stats.resolved_count) || 0,
        rejected_count: parseInt(stats.rejected_count) || 0,
        departments_data: deptStats,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  },
};

module.exports = complaintController;
