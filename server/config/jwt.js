require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET,
  expiryTime: process.env.JWT_EXPIRY || '8h',
};
