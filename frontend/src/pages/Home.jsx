import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Users } from 'lucide-react';
import api from '../services/api';
import GoogleMap from '../components/GoogleMap';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    fetchRestaurants();
  }, [cityFilter, dateFilter, timeFilter, partySize]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (cityFilter) params.append('city', cityFilter);
      if (dateFilter) params.append('availableDate', dateFilter);
      if (timeFilter) params.append('availableTime', timeFilter);
      if (partySize) params.append('partySize', partySize);

      const response = await api.get(`/restaurants?${params.toString()}`);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container-fluid py-20 lg:py-32 relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="hero-text mb-6 animate-slide-up">
              Find Your Perfect Table
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-12 text-primary-100 max-w-3xl mx-auto leading-relaxed">
              Discover amazing restaurants and book your next dining experience with TableTrek
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => {
                  const featuredSection = document.getElementById('featured-restaurants');
                  if (featuredSection) {
                    featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="btn-accent px-8 py-4 text-lg"
              >
                Explore Restaurants
              </button>
              <Link 
                to="/learn-more"
                className="btn-outline bg-white/10 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg inline-block text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Search Section */}
      <div className="container-fluid -mt-12 relative z-20">
        <div className="card-premium shadow-premium">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6 text-center">
            Find Your Perfect Restaurant
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Search Restaurants
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Restaurant name or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                City
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Enter city"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="time"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-primary-500" />
              <span className="text-sm font-semibold text-neutral-700">Party Size:</span>
              <select
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value))}
                className="select-field w-20"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={fetchRestaurants}
              className="btn-primary px-8"
            >
              Search Restaurants
            </button>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div id="featured-restaurants" className="container-fluid py-16">
        <div className="text-center mb-12">
          <h2 className="heading-responsive text-neutral-800 mb-4">
            Featured Restaurants
          </h2>
          <p className="text-responsive text-neutral-600 max-w-2xl mx-auto">
            Discover amazing dining experiences from our curated selection of restaurants
          </p>
        </div>

        {loading ? (
          <div className="flex-center py-20">
            <div className="loading-spinner"></div>
            <p className="ml-4 text-neutral-600 font-medium">Loading restaurants...</p>
          </div>
        ) : (
          <div className="grid-auto-fit">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="card-premium group animate-fade-in">
                <div className="relative mb-6 overflow-hidden rounded-xl">
                  {restaurant.lat && restaurant.lon ? (
                    <GoogleMap 
                      lat={parseFloat(restaurant.lat)}
                      lon={parseFloat(restaurant.lon)}
                      name={restaurant.name}
                      address={restaurant.address}
                      className="w-full h-48 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex-center group-hover:scale-105 transition-transform duration-300">
                      <MapPin className="h-16 w-16 text-primary-400" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 text-warning-500 fill-current" />
                      <span className="text-sm font-semibold text-neutral-700">
                        {getAverageRating(restaurant.reviews) || 'New'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center text-neutral-500 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{restaurant.city}</span>
                    </div>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {restaurant.address}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div className="flex items-center text-neutral-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        {restaurant.openingTime} - {restaurant.closingTime}
                      </span>
                    </div>
                    
                    <Link
                      to={`/restaurant/${restaurant.id}`}
                      className="btn-primary text-sm px-6"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex-center mx-auto mb-6">
              <Search className="h-12 w-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-display font-semibold text-neutral-800 mb-2">
              No restaurants found
            </h3>
            <p className="text-neutral-600 max-w-md mx-auto">
              Try adjusting your search criteria or explore different cities and times.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
