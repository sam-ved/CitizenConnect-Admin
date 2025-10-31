const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, userController.getAll);
router.get('/:email', authMiddleware, userController.getByEmail);

module.exports = router;
