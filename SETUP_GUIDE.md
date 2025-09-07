# TableTrek - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
- **Redis** (Optional) - [Download here](https://redis.io/download)

### 1. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Database Setup

#### Create PostgreSQL Database
```sql
CREATE DATABASE tabletrek;
```

#### Run Migrations
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

#### Seed Database (Optional)
```bash
npm run seed
```

### 3. Environment Configuration

#### Backend Environment
Copy `backend/env.example` to `backend/.env` and fill in your values:

```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/tabletrek
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here

# Optional (for production features)
REDIS_URL=redis://localhost:6379
SENDGRID_API_KEY=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
```

#### Frontend Environment
Copy `frontend/env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```
### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🔧 Configuration Details

### Database Configuration
The application uses PostgreSQL with Prisma ORM. The database schema includes:
- Users (customers and restaurant owners)
- Restaurants and tables
- Bookings and reviews
- Waitlist entries
- Notifications

### Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Secure password hashing with bcrypt

### Optional Services

#### Redis (Recommended for Production)
- Used for booking locks and job queues
- Application works without Redis (with limited functionality)
- Install Redis and set `REDIS_URL` in environment

#### Email Notifications (SendGrid)
- Booking confirmations and reminders
- Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`
- Works without SendGrid (logs emails to console)

#### SMS Notifications (Twilio)
- SMS confirmations and reminders
- Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`
- Works without Twilio (logs SMS to console)

## 🧪 Test Accounts

After seeding the database, you can use these test accounts:

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `adminpass`
- **Access**: Restaurant management, admin dashboard

### User Account
- **Email**: `user@example.com`
- **Password**: `userpass`
- **Access**: Browse restaurants, make bookings, leave reviews



