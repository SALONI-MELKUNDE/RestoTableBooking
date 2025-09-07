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


