import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, MapPin, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Booking = () => {
  const { restaurantId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    partySize: 2,
    duration: 2
  });
  
  const localDateForInput = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const buildDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}`);


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchRestaurant();
  }, [restaurantId, isAuthenticated, navigate]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/restaurants/${restaurantId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      if (error.response?.status === 404) {
        setError('Restaurant not found');
      } else {
        setError('Failed to load restaurant details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const checkAvailability = async () => {
    if (!formData.date || !formData.time) return;
    
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(startTime.getTime() + formData.duration * 60 * 60 * 1000);
      
      const response = await api.get(
        `/bookings/restaurants/${restaurantId}/availability`,
        { params: {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          partySize: formData.partySize
        }}
   );
      
      return response.data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setBookingLoading(true);
  setError('');
  setSuccess('');

  if (!formData.date || !formData.time) {
    setError('Please select both date and time');
    setBookingLoading(false);
    return;
  }

  const selectedDateTime = buildDateTime(formData.date, formData.time);
  const now = new Date();
  if (selectedDateTime <= now) {
    setError('Please select a future date and time');
    setBookingLoading(false);
    return;
  }

  // opening-hours validation
  const startTime = buildDateTime(formData.date, formData.time);
  const endTime = new Date(startTime.getTime() + parseFloat(formData.duration) * 60 * 60 * 1000);
  const openTime = buildDateTime(formData.date, restaurant.openingTime);
  const closeTime = buildDateTime(formData.date, restaurant.closingTime);
  if (startTime < openTime || endTime > closeTime) {
    setError(`This restaurant accepts bookings between ${restaurant.openingTime} and ${restaurant.closingTime}. Please choose a time within hours.`);
    setBookingLoading(false);
    return;
  }

  // availability check
  const available = await checkAvailability();
  if (!available) {
    setError('That slot is unavailable. Please pick another time.');
    setBookingLoading(false);
    return;
  }

  try {
    const response = await api.post('/bookings', {
      restaurantId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      partySize: parseInt(formData.partySize, 10)
    });

    setSuccess('Booking confirmed! You will receive a confirmation email shortly.');
    setTimeout(() => {
      navigate('/profile');
    }, 2000);

  } catch (error) {
    console.error('Booking error:', error);
    setError(error.response?.data?.message || 'Failed to create booking');
  } finally {
    setBookingLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Info */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {restaurant.name}
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{restaurant.address}, {restaurant.city}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2" />
                <span>Open {restaurant.openingTime} - {restaurant.closingTime}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Booking for:</h3>
              <p className="text-gray-700">{user?.name}</p>
              <p className="text-gray-600 text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Your Table</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={localDateForInput()}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1" />
                  Party Size
                </label>
                <select
                  id="partySize"
                  name="partySize"
                  value={formData.partySize}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value={1}>1 hour</option>
                  <option value={1.5}>1.5 hours</option>
                  <option value={2}>2 hours</option>
                  <option value={2.5}>2.5 hours</option>
                  <option value={3}>3 hours</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

