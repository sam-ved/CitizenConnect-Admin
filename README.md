# CitizenConnect Admin Dashboard

A comprehensive admin dashboard for managing citizen complaints with department-wise visualizations and full admin access to user data.

## Features

- **Admin Authentication**: Secure login system with JWT tokens
- **Dashboard**: Real-time statistics and visualizations of complaints by department
- **Complaints Management**: View, filter, edit, and delete complaints
- **Citizens Management**: View unique citizens and their complaint history
- **Departments Management**: Manage departments and track complaints per department
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Database**: PostgreSQL
- **Template Engine**: EJS
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Google Charts

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd CitizenConnect-Admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create PostgreSQL database

```bash
psql -U postgres
CREATE DATABASE citizenconnect;
\q
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=citizenconnect

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=8h

# Admin Seed
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 5. Initialize the database

Run the seed script to create tables and insert initial data:

```bash
npm run seed
```

This will:
- Create the admins, departments, and complaints tables
- Seed 4 initial departments (Water, Roads, Electricity, Sanitation)
- Create an admin user with credentials from `.env`

### 6. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## Usage

### Login

1. Navigate to `http://localhost:3000/login`
2. Enter credentials (default: username: `admin`, password: `admin123`)
3. You'll be redirected to the dashboard

### Dashboard

- View summary statistics (Total, Pending, Resolved, Rejected complaints)
- See visualizations of complaints by department
- View recent complaints in a table

### Complaints Management

- **View All**: Browse and filter complaints by department, status, date range, or search
- **View Details**: Click on a complaint to see full details
- **Edit**: Update complaint information and status
- **Delete**: Remove complaints
- **Filtering**: Filter by department, status, date range, or citizen information

### Citizens Management

- **View Citizens**: See all unique citizens who have filed complaints
- **Search**: Find citizens by name or email
- **View History**: Click on a citizen to see all their complaints and statistics

### Departments Management

- **View Departments**: See all departments and their complaint counts
- **Add Department**: Create new departments
- **Edit Department**: Update department information or status
- **Delete Department**: Remove departments (only if no complaints)

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with username and password
- `GET /api/auth/logout` - Logout (clears session)

### Dashboard

- `GET /api/dashboard/stats` - Get statistics and department-wise complaint counts

### Complaints

- `GET /api/complaints` - Get paginated list of complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint details
- `POST /api/complaints` - Create new complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Citizens

- `GET /api/users` - Get paginated list of unique citizens
- `GET /api/users/:email` - Get citizen details and their complaints

### Departments

- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

## Database Schema

### admins table
- id (UUID, primary key)
- username (unique string)
- email (unique string)
- password_hash (bcrypt hashed)
- created_at, updated_at (timestamps)

### departments table
- id (UUID, primary key)
- name (unique string)
- description (text)
- is_active (boolean)
- created_at (timestamp)

### complaints table
- id (UUID, primary key)
- title (varchar 200)
- description (text)
- department_id (foreign key)
- status (enum: pending, in_progress, resolved, rejected)
- citizen_name, citizen_email, citizen_phone (strings)
- created_at, updated_at, resolved_at (timestamps)

## Project Structure

```
CitizenConnect-Admin/
├── server/
│   ├── config/          # Database and JWT configuration
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware (auth, error handling)
│   ├── controllers/     # Business logic for each resource
│   ├── models/          # Database query functions
│   ├── app.js           # Express app setup
│   ├── server.js        # Entry point
│   └── seedDatabase.js  # Database initialization script
├── public/
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
├── views/              # EJS templates
├── package.json        # Dependencies
├── .env                # Environment variables (git-ignored)
└── README.md           # This file
```

## Development

### Running Tests

```bash
npm test
```

### Code Style

This project follows standard JavaScript conventions. Consider using ESLint for consistency.

## Security Notes

- **Passwords**: All passwords are hashed with bcrypt (10 salt rounds)
- **JWT**: Tokens expire after 8 hours
- **CORS**: Implement CORS if needed for frontend served separately
- **HTTPS**: Use HTTPS in production
- **SQL Injection**: Uses parameterized queries to prevent SQL injection

## Troubleshooting

### Database connection error

- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify the database `citizenconnect` exists

### Port already in use

- Change the PORT in `.env`
- Or kill the process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

### Module not found

- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## License

This project is open source and available under the ISC license.

## Support

For issues and questions, please create an issue in the repository.
