const express = require('express');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', complaintController.create);
router.get('/stats', authMiddleware, complaintController.getStats);
router.get('/:id', authMiddleware, complaintController.getById);
router.get('/', authMiddleware, complaintController.getAll);
router.put('/:id', authMiddleware, complaintController.update);
router.delete('/:id', authMiddleware, complaintController.delete);

module.exports = router;
