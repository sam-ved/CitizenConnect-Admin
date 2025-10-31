const express = require('express');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);

// Dashboard endpoint for stats
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  const complaintController = require('./controllers/complaintController');
  complaintController.getStats(req, res);
});

// Page routes (all require auth)
app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('layout', { page: 'dashboard', currentPage: 'dashboard' });
});

app.get('/complaints', authMiddleware, (req, res) => {
  res.render('layout', { page: 'complaints', currentPage: 'complaints' });
});

app.get('/users', authMiddleware, (req, res) => {
  res.render('layout', { page: 'users', currentPage: 'users' });
});

app.get('/departments', authMiddleware, (req, res) => {
  res.render('layout', { page: 'departments', currentPage: 'departments' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
