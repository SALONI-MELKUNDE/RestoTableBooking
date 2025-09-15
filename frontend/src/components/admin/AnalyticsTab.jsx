import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Star,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Eye
} from 'lucide-react';

const AnalyticsTab = ({ restaurant, bookings }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageRating: 0,
    repeatCustomers: 0,
    peakHours: [],
    popularDays: [],
    revenueGrowth: 0,
    bookingGrowth: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [bookings, timeRange]);

  const calculateAnalytics = () => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const filteredBookings = bookings.filter(booking => 
      new Date(booking.startTime) >= startDate && booking.status === 'CONFIRMED'
    );

    // Calculate revenue (assuming average meal price)
    const avgMealPrice = 45; // This should come from actual order data
    const totalRevenue = filteredBookings.reduce((sum, booking) => 
      sum + (booking.partySize * avgMealPrice), 0
    );

    // Calculate peak hours
    const hourCounts = {};
    filteredBookings.forEach(booking => {
      const hour = new Date(booking.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Calculate popular days
    const dayCounts = {};
    filteredBookings.forEach(booking => {
      const day = new Date(booking.startTime).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const popularDays = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({ day: dayNames[parseInt(day)], count }));

    // Calculate growth (mock data for demonstration)
    const revenueGrowth = Math.random() * 20 - 10; // -10% to +10%
    const bookingGrowth = Math.random() * 30 - 15; // -15% to +15%

    setAnalytics({
      totalRevenue,
      totalBookings: filteredBookings.length,
      averageRating: restaurant.reviews?.length > 0 
        ? restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) / restaurant.reviews.length
        : 0,
      repeatCustomers: Math.floor(filteredBookings.length * 0.3), // Mock calculation
      peakHours,
      popularDays,
      revenueGrowth,
      bookingGrowth
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Analytics Dashboard
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select-field"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="btn-outline flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Revenue</p>
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(analytics.totalRevenue)}
              </p>
              <div className="flex items-center mt-2">
                {analytics.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-success-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-error-600" />
                )}
                <span className={`text-sm ml-1 ${
                  analytics.revenueGrowth >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {Math.abs(analytics.revenueGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-success-600" />
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Bookings</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.totalBookings}</p>
              <div className="flex items-center mt-2">
                {analytics.bookingGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-success-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-error-600" />
                )}
                <span className={`text-sm ml-1 ${
                  analytics.bookingGrowth >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {Math.abs(analytics.bookingGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Average Rating</p>
              <p className="text-2xl font-bold text-neutral-900">
                {analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : 'N/A'}
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-warning-500 fill-current" />
                <span className="text-sm text-neutral-600 ml-1">
                  {restaurant.reviews?.length || 0} reviews
                </span>
              </div>
            </div>
            <Star className="h-8 w-8 text-warning-600" />
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Repeat Customers</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics.repeatCustomers}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-success-600" />
                <span className="text-sm text-success-600 ml-1">
                  {((analytics.repeatCustomers / Math.max(analytics.totalBookings, 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Peak Hours Chart */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-neutral-800">Peak Hours</h3>
            <BarChart3 className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {analytics.peakHours.map((peak, index) => (
              <div key={peak.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-primary-600' : 
                    index === 1 ? 'bg-primary-500' : 'bg-primary-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{formatHour(peak.hour)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(peak.count / Math.max(...analytics.peakHours.map(p => p.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-8">{peak.count}</span>
                </div>
              </div>
            ))}
            {analytics.peakHours.length === 0 && (
              <p className="text-neutral-500 text-center py-8">No booking data available</p>
            )}
          </div>
        </div>

        {/* Popular Days Chart */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-neutral-800">Popular Days</h3>
            <PieChart className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="space-y-4">
            {analytics.popularDays.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-success-600' : 
                    index === 1 ? 'bg-success-500' : 'bg-success-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{day.day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-success-600 h-2 rounded-full"
                      style={{ width: `${(day.count / Math.max(...analytics.popularDays.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-8">{day.count}</span>
                </div>
              </div>
            ))}
            {analytics.popularDays.length === 0 && (
              <p className="text-neutral-500 text-center py-8">No booking data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-neutral-800">Revenue Trend</h3>
          <LineChart className="h-5 w-5 text-neutral-400" />
        </div>
        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded-lg">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">Revenue chart visualization would appear here</p>
            <p className="text-sm text-neutral-500 mt-2">
              Integration with charting library (Chart.js, Recharts) recommended
            </p>
          </div>
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="card-premium">
        <h3 className="text-lg font-display font-bold text-neutral-800 mb-6">Booking Status Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { status: 'CONFIRMED', label: 'Confirmed', color: 'success', count: bookings.filter(b => b.status === 'CONFIRMED').length },
            { status: 'PENDING', label: 'Pending', color: 'warning', count: bookings.filter(b => b.status === 'PENDING').length },
            { status: 'CANCELLED', label: 'Cancelled', color: 'error', count: bookings.filter(b => b.status === 'CANCELLED').length }
          ].map(item => (
            <div key={item.status} className="text-center">
              <div className={`w-16 h-16 rounded-full bg-${item.color}-100 flex items-center justify-center mx-auto mb-3`}>
                <span className={`text-2xl font-bold text-${item.color}-600`}>{item.count}</span>
              </div>
              <p className="font-medium text-neutral-800">{item.label}</p>
              <p className="text-sm text-neutral-600">
                {bookings.length > 0 ? ((item.count / bookings.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;