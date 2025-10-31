const express = require('express');
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, departmentController.create);
router.get('/', authMiddleware, departmentController.getAll);
router.put('/:id', authMiddleware, departmentController.update);
router.delete('/:id', authMiddleware, departmentController.delete);

module.exports = router;
