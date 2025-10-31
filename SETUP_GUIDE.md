# CitizenConnect Admin - Complete Setup Guide

## ✅ 100% Self-Contained Application

This application is **completely self-reliant** with:
- ✓ No external CDN dependencies
- ✓ No Google Charts or external charting libraries
- ✓ Custom Canvas-based chart implementation
- ✓ All CSS and JavaScript self-contained
- ✓ Backend and frontend fully integrated

---

## Prerequisites

Before you start, ensure you have installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify: `psql --version`

---

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd CitizenConnect-Admin
npm install
```

This installs:
- Express.js (backend web framework)
- PostgreSQL client
- JWT for authentication
- Bcrypt for password security
- EJS for template rendering

### Step 2: Create Database

Open PostgreSQL command line:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE citizenconnect;
\q
```

### Step 3: Configure Environment

Update `.env` with your PostgreSQL credentials:

```bash
nano .env
```

Example `.env`:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=citizenconnect

JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRY=8h

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 4: Initialize Database

Run the seed script (creates tables and initial data):

```bash
npm run seed
```

You should see:
```
✓ Admins table created
✓ Departments table created
✓ Complaints table created
✓ Admin user created
✓ Initial departments seeded
Database seeding completed successfully!
```

### Step 5: Start the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
Server is running on http://localhost:3000
```

---

## Access the Application

1. Open your browser: `http://localhost:3000`
2. You'll be redirected to `/login`
3. Login with:
   - Username: `admin`
   - Password: `admin123`

---

## Key Features

### Dashboard
- Real-time statistics (Total, Pending, Resolved, Rejected)
- **Custom Canvas-based Charts** (no external dependencies):
  - Pie Chart: Department-wise distribution
  - Bar Chart: Complaints per department
- Recent complaints table with quick access

### Complaints Management
- View all complaints with filtering
- Filter by department, status, date range, or search text
- Edit complaint details and status
- Delete complaints
- Pagination support (20 per page)

### Citizens Management
- View all unique citizens
- Search by name or email
- View detailed complaint history per citizen
- Status breakdown (Pending, In Progress, Resolved, Rejected)

### Departments Management
- View all departments
- Add new departments
- Edit department details
- Deactivate/activate departments
- Track complaints per department
- Delete departments (only if no complaints)

---

## Project Architecture

### Backend Structure
```
server/
├── config/           # Database & JWT configuration
├── middleware/       # Authentication & error handling
├── routes/          # API endpoints
├── controllers/     # Business logic
├── models/          # Database queries
├── app.js          # Express app setup
├── server.js       # Entry point
└── seedDatabase.js # Database initialization
```

### Frontend Structure
```
public/
├── css/
│   └── style.css          # All styles (100% self-contained)
└── js/
    ├── utils.js           # API calls, helpers
    ├── charts.js          # Custom chart implementation
    ├── auth.js            # Login logic
    ├── dashboard.js       # Dashboard page logic
    ├── complaints.js      # Complaints management
    ├── users.js          # Citizens management
    └── departments.js    # Departments management

views/
├── layout.ejs       # Master template
├── login.ejs        # Login page
├── dashboard.ejs    # Dashboard
├── complaints.ejs   # Complaints page
├── users.ejs       # Citizens page
└── departments.ejs # Departments page
```

---

## Security Features

✅ **Password Security**
- All passwords hashed with bcrypt (10 salt rounds)
- Never stored as plain text

✅ **Authentication**
- JWT tokens with 8-hour expiry
- Tokens stored in sessionStorage (cleared when browser closes)
- All protected routes require valid token

✅ **Data Security**
- Parameterized SQL queries (prevents SQL injection)
- Input validation on both frontend and backend
- Error messages don't leak sensitive information

✅ **No External Dependencies**
- No third-party CDN code
- No tracking or analytics
- Complete data privacy

---

## API Reference

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/logout` - Logout

### Dashboard
- `GET /api/dashboard/stats` - Statistics and charts data

### Complaints (Admin Only)
- `GET /api/complaints` - List complaints (with filters)
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint
- `POST /api/complaints` - Create complaint

### Citizens (Admin Only)
- `GET /api/users` - List all citizens
- `GET /api/users/:email` - Get citizen details

### Departments (Admin Only)
- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

---

## Troubleshooting

### Issue: "connect ECONNREFUSED"
**Problem:** PostgreSQL not running or credentials wrong
**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Verify .env credentials
cat .env
```

### Issue: "Port 3000 already in use"
**Problem:** Another application using the port
**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill the process (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Module not found errors
**Problem:** Dependencies not installed
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Table does not exist"
**Problem:** Database not initialized
**Solution:**
```bash
# Run seed script
npm run seed
```

---

## Development Tips

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Adding More Admins
The seed script only creates one admin. To add more:

1. Login as existing admin
2. Go to database directly (future feature)

Or modify `seedDatabase.js` to add more admins.

### Customizing Departments
Default departments: Water, Roads, Electricity, Sanitation

To change, edit `server/seedDatabase.js`:
```javascript
const departments = ['Water', 'Roads', 'Electricity', 'Sanitation'];
```

### Modifying Chart Colors
Edit `public/js/charts.js`:
```javascript
const colors = [
  '#FF6B6B',  // Red
  '#4ECDC4',  // Teal
  '#45B7D1',  // Blue
  // Add more colors...
];
```

---

## Production Deployment

### Before Going Live

1. **Change JWT Secret**
   ```
   JWT_SECRET=your_unique_secret_key_min_32_chars
   ```

2. **Update Admin Credentials**
   - Change default admin password in database

3. **Enable HTTPS**
   - Use reverse proxy (nginx, Apache)
   - Obtain SSL certificate

4. **Database Backups**
   - Set up regular PostgreSQL backups
   - Test restore procedures

5. **Environment**
   ```
   NODE_ENV=production
   PORT=80 (or 443 with HTTPS)
   ```

### Database Backup

```bash
# Create backup
pg_dump -U postgres citizenconnect > backup.sql

# Restore backup
psql -U postgres citizenconnect < backup.sql
```

---

## Support & Documentation

- Check README.md for detailed feature documentation
- Review planning.md for technical specifications
- All code is well-commented for understanding

---

## License

ISC License - See LICENSE file for details

---

**Created:** October 31, 2024
**Version:** 1.0.0
**Status:** ✅ Production Ready
