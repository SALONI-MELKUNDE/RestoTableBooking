# TableTrek - Complete Setup Guide

---

## 📑 Index

- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [1. Install Dependencies](#1-install-dependencies)
  - [2. Database Setup](#2-database-setup)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Start the Application](#4-start-the-application)
  - [5. Access the Application](#5-access-the-application)
- [Configuration Details](#-configuration-details)
  - [Database Configuration](#database-configuration)
  - [Authentication](#authentication)
  - [Optional Services](#optional-services)
    - [Redis](#redis-recommended-for-production)
    - [Email Notifications (SendGrid)](#email-notifications-sendgrid)
- [Test Accounts](#-test-accounts)
- [Features](#-features)
  - [For Customers](#for-customers)
  - [For Admin](#for-admin)
- [Troubleshooting](#-troubleshooting)
  - [1. Database Connection Error](#1-database-connection-error)
  - [2. Redis Connection Error](#2-redis-connection-error)
  - [3. Port Already in Use](#3-port-already-in-use)
  - [4. Module Not Found](#4-module-not-found)
  - [5. Frontend API Connection Error](#5-frontend-api-connection-error)
  - [Development Tips](#development-tips)
- [Production Deployment](#-production-deployment)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Environment Variables for Production](#environment-variables-for-production)
- [Support](#-support)

---

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
CREATE DATABASE RestoTableBooking;
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
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/RestoTableBooking?schema=public
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here

# Optional (for production features)
REDIS_URL=redis://localhost:6379
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=notifications@yourdomain.com
```

#### Frontend Environment
Copy `frontend/env.example` to `frontend/.env`:

```env
VITE_API_URL=/api
# or
VITE_API_URL=https://api.yourdomain.com/api
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

---

## 🔧 Configuration Details

### Database Configuration
The application uses PostgreSQL with Prisma ORM. The database schema includes:
- Users (customers and restaurant owners)
- Restaurants and tables
- Bookings and reviews
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

---

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

---

## 📱 Features

### Customers
- ✅ Browse and search restaurants
- ✅ Real-time table availability
- ✅ Book tables with confirmation
- ✅ Manage bookings and cancellations
- ✅ Leave reviews and ratings
- ✅ Instant feedback if all tables are booked (e.g., "No available tables for selected time")

### ADMIN
- ✅ Create and manage restaurant profiles
- ✅ Set up tables (add labels, seats)
- ✅ Create menus (name, description)
- ✅ Manage menu items (add/edit/delete, price, category, availability)
- ✅ View and manage bookings
- ✅ Manage waiting list (pending): confirm & assign or reject
- ✅ Able to view analytics dashbord 

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

#### 2. Redis Connection Error
```
Redis Client Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Either install Redis or remove `REDIS_URL` from environment.

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change `PORT` in backend `.env` or stop the process using the port.

#### 4. Module Not Found
```
Error: Cannot find module '@prisma/client'
```
**Solution**: Run `npx prisma generate` in the backend directory.

#### 5. Frontend API Connection Error
```
Network Error: Failed to fetch
```
**Solution**: Ensure backend is running and `VITE_API_URL` is correct.

#### 6. 401 Unauthorized / Token Refresh Loop
```
Request failed with status code 401
```
**Solution**: Ensure backend implements `/auth/refresh` and `/auth/me`; clear `accessToken` & `refreshToken` from Local Storage, then sign in again.

#### 7. Tailwind Aspect Ratio Classes Don’t Work
```
Classes like "aspect-w-16 aspect-h-9" have no effect
```
**Solution**: `npm i @tailwindcss/aspect-ratio` and enable the plugin in `tailwind.config.js`, then restart Vite.

### Development Tips

1. **Hot Reload**: Frontend uses Vite HMR; run backend with a watcher (e.g., `nodemon`). Restart after changing `.env`, `tailwind.config.js`, or `vite.config.js`.
2. **Database Reset**: `npx prisma migrate reset` (destructive), then `npx prisma generate`. 
3. **Logs**: Check browser and server consoles, `run npm run lint`. If `@prisma/client` is “module not found”, run `npx prisma generate`.
4. **Network**: Backend on `http://localhost:3000`; set `VITE_API_URL=/api` (Vite proxy). Free ports `5173/3000`. Ensure `/auth/me` and `/auth/refresh` exist. Install `@tailwindcss/aspect-ratio`. 

---

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Set up Redis for production
4. Configure proper JWT secrets
5. Set up SendGrid for notifications

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update `VITE_API_URL` to your production API URL

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/RestoTableBooking?schema=public
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=very-long-random-secret-key
REFRESH_TOKEN_SECRET=another-very-long-random-secret-key
SENDGRID_API_KEY=your-production-sendgrid-key
```
---

## 📞 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, Redis) are running
4. Check the troubleshooting section above

The application is designed to work with minimal configuration - only PostgreSQL

