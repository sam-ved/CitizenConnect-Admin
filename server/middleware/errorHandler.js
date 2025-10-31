const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.message === 'Invalid or expired token') {
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Server error. Please try again.' });
};

module.exports = errorHandler;
