# TableTrek - Restaurant Table Booking Platform

A full-stack web app for restaurant discovery, booking, reviews, and owner/admin management.

---

## 📑 Index
- [Features](#-features)
  - [Customers](#customers)
  - [Restaurant Owners (Admin)](#restaurant-owners-admin)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Database Setup](#3-database-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. Start the Application](#5-start-the-application)
- [Database Schema (Overview)](#-database-schema-overview)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Restaurants](#restaurants)
  - [Bookings](#bookings)
  - [Reviews](#reviews)
  - [Menus (public + owner)](#menus-public--owner)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Usage](#-usage)
  - [For Customers](#for-customers)
  - [For Restaurant Owners (Admin)](#for-restaurant-owners)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Customers
- ✅ Browse and search restaurants
- ✅ Book tables with confirmation
- ✅ Manage bookings and cancellations
- ✅ Leave reviews and ratings
- ✅ Instant feedback if all tables are booked (e.g., "No available tables for selected time")


### Restaurant Owners (Admin)
- ✅ Create and manage restaurant profiles
- ✅ Set up tables (add labels, seats)
- ✅ Create menus (name, description)
- ✅ Manage menu items (add/edit/delete, price, category, availability)
- ✅ View and manage bookings
- ✅ Manage waiting list (pending): confirm & assign or reject
- ✅ Able to view analytics dashbord


---

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **Redis** for caching and job queues
- **JWT** for authentication
- **BullMQ** for background job processing
- **SendGrid** for email notifications
- **Twilio** for SMS notifications

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

---

## 📋 Prerequisites

Before running the application, make sure you have:

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- SendGrid account (for emails)
- Twilio account (for SMS)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tabletrek
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/tabletrek

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
SENDGRID_API_KEY=your-sendgrid-api-key

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
OPENWEATHER_API_KEY=your-openweather-api-key

# Server
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

---

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Customer and Admin accounts
- **Restaurants**: Restaurant information and settings
- **RestaurantTables**: Table configurations for each restaurant
- **Menus & MenuItems**: Restaurant menu management
- **Bookings**: Customer table reservations
- **Reviews**: Customer reviews and ratings

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (Admin)
- `PATCH /api/restaurants/:id` - Update restaurant (Admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (Admin)

### Bookings
- `GET /api/bookings/restaurants/:id/availability` - Check availability
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/users/:id/bookings` - Get user bookings
- `GET /api/bookings/admin/restaurants/:id/bookings` - Get restaurant bookings (Admin)

### Reviews
- `GET /api/restaurants/:id/reviews` - Get restaurant reviews
- `POST /api/restaurants/:id/reviews` - Create review
- `PATCH /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```
---

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Connect your repository to Railway or Render
2. Set environment variables in the deployment platform
3. Deploy the backend service

### Frontend Deployment (Vercel)
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables

---

## 📱 Usage

### For Customers
1. **Sign Up**: Create an account with your details
2. **Browse Restaurants**: Use the search and filter options
3. **Book a Table**: Select date, time, and party size
4. **Manage Bookings**: View and cancel bookings in your profile
5. **Leave Reviews**: Rate and review restaurants after dining

### For Admin
1. **Register as Admin**: Sign up with admin role
2. **Add Restaurant**: Create your restaurant profile
3. **Set Up Tables**: Configure table capacities
4. **Manage Menu**: Add menus and menu items
5. **View Bookings**: Monitor reservations and customer details

---

## 🔧 Configuration

### PostgreSQL Connection
Configure Database connection in your `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/RestoTableBooking?schema=public
```

### JWT Configuration
```env
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Email Notifications
Configure SendGrid in your `.env` file:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=no-reply@yourdomain.com
```

### Redis Configuration
Ensure Redis is running and accessible:
```env
REDIS_URL=redis://localhost:6379
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**TableTrek** - Making restaurant reservations simple and efficient! 🍽️
