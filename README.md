# TableTrek - Restaurant Booking Platform

TableTrek is a comprehensive restaurant booking platform that allows users to discover, book tables at restaurants, and manage their dining experiences. Restaurant owners can manage their establishments, view bookings, and handle customer interactions.

## 🚀 Features

### For Customers
- **Restaurant Discovery**: Browse and search restaurants by name, city, date, and time.
- **Real-time Booking**: Book tables with real-time availability checking. 
- **User Dashboard**: View and manage bookings, cancel reservations
- **Reviews & Ratings**: Leave reviews after dining experiences
- **Waitlist**: Join waitlists when restaurants are full
- **Notifications**: Email confirmations and reminders

### For Restaurant Owners (Admin)
- **Restaurant Management**: Create and manage restaurant profiles
- **Table Management**: Add and configure restaurant tables
- **Menu Management**: Create menus and menu items
- **Booking Management**: View and manage all restaurant bookings
- **Customer Communication**: Send notifications to customers

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

## 📋 Prerequisites

Before running the application, make sure you have:

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- SendGrid account (for emails)
- Twilio account (for SMS)

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

# SMS
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

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
cd ../frontend
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

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📊 Database Schema

The application uses the following main entities:

- **Users**: Customer and restaurant owner accounts
- **Restaurants**: Restaurant information and settings
- **RestaurantTables**: Table configurations for each restaurant
- **Menus & MenuItems**: Restaurant menu management
- **Bookings**: Customer reservations
- **Reviews**: Customer reviews and ratings
- **WaitlistEntries**: Waitlist management
- **Notifications**: Communication tracking

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

### Waitlist
- `POST /api/restaurants/:id/waitlist` - Join waitlist
- `DELETE /api/waitlist/:id` - Leave waitlist
- `GET /api/users/:id/waitlist` - Get user waitlist
- `GET /api/admin/restaurants/:id/waitlist` - Get restaurant waitlist (Admin)

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

## 📱 Usage

### For Customers
1. **Sign Up**: Create an account with your details
2. **Browse Restaurants**: Use the search and filter options
3. **Book a Table**: Select date, time, and party size
4. **Manage Bookings**: View and cancel bookings in your profile
5. **Leave Reviews**: Rate and review restaurants after dining

### For Restaurant Owners
1. **Register as Admin**: Sign up with admin role
2. **Add Restaurant**: Create your restaurant profile
3. **Set Up Tables**: Configure table layouts and capacities
4. **Manage Menu**: Add menus and menu items
5. **View Bookings**: Monitor reservations and customer details
6. **Handle Waitlist**: Manage waitlist entries and notifications

## 🔧 Configuration

### Email Notifications
Configure SendGrid in your `.env` file:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### SMS Notifications
Configure Twilio in your `.env` file:
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

### Redis Configuration
Ensure Redis is running and accessible:
```env
REDIS_URL=redis://localhost:6379
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

-  Mobile app development
-  Advanced analytics dashboard
-  Integration with payment gateways
-  Multi-language support
-  Advanced search and filtering
-  Social media integration
-  Loyalty program features

---

**TableTrek** - Making restaurant reservations simple and efficient! 🍽️
