import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChefHat, 
  Users, 
  Clock, 
  Star, 
  MapPin, 
  Calendar,
  Shield,
  Smartphone,
  Heart,
  Award,
  ArrowRight
} from 'lucide-react';

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container-fluid py-20 lg:py-32 relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="hero-text mb-6 animate-slide-up">
              About TableTrek
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-12 text-primary-100 max-w-4xl mx-auto leading-relaxed">
              Your gateway to exceptional dining experiences. Discover, book, and enjoy the best restaurants in your city.
            </p>
            <Link 
              to="/"
              className="btn-accent px-8 py-4 text-lg inline-block"
            >
              Start Exploring
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container-fluid py-16">
        <div className="text-center mb-16">
          <h2 className="heading-responsive text-neutral-800 mb-4">
            Why Choose TableTrek?
          </h2>
          <p className="text-responsive text-neutral-600 max-w-3xl mx-auto">
            We make dining out effortless with our comprehensive platform designed for food lovers and restaurant enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Easy Booking</h3>
            <p className="text-neutral-600 leading-relaxed">
              Book tables instantly with real-time availability. No more waiting on hold or wondering if your table is confirmed.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <MapPin className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Discover Local Gems</h3>
            <p className="text-neutral-600 leading-relaxed">
              Find hidden culinary treasures and popular dining spots in your area with detailed information and reviews.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <Star className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Verified Reviews</h3>
            <p className="text-neutral-600 leading-relaxed">
              Read authentic reviews from real diners to make informed decisions about your next dining experience.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <ChefHat className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Menu Preview</h3>
            <p className="text-neutral-600 leading-relaxed">
              Browse detailed menus with prices, ingredients, and dietary information before you arrive.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Secure & Reliable</h3>
            <p className="text-neutral-600 leading-relaxed">
              Your personal information and booking details are protected with enterprise-grade security.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="card-premium text-center group">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
              <Smartphone className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">Mobile Friendly</h3>
            <p className="text-neutral-600 leading-relaxed">
              Book on the go with our responsive design that works perfectly on all devices.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="heading-responsive text-neutral-800 mb-4">
              How TableTrek Works
            </h2>
            <p className="text-responsive text-neutral-600 max-w-3xl mx-auto">
              Getting your perfect table is just a few clicks away
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Search & Discover</h3>
              <p className="text-neutral-600 leading-relaxed">
                Browse restaurants by location, cuisine, or availability. Use our smart filters to find exactly what you're looking for.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Book Your Table</h3>
              <p className="text-neutral-600 leading-relaxed">
                Select your preferred date, time, and party size. Get instant confirmation for your reservation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-800 mb-4">Enjoy Your Meal</h3>
              <p className="text-neutral-600 leading-relaxed">
                Arrive at your restaurant and enjoy your dining experience. Don't forget to leave a review!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="hero-gradient py-16">
        <div className="container-fluid">
          <div className="text-center mb-12">
            <h2 className="heading-responsive text-white mb-4">
              Trusted by Food Lovers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-primary-100">Partner Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-primary-100">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-primary-100">Successful Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.8★</div>
              <div className="text-primary-100">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="container-fluid text-center">
          <div className="max-w-3xl mx-auto">
            <Heart className="h-16 w-16 text-primary-600 mx-auto mb-6" />
            <h2 className="heading-responsive text-neutral-800 mb-6">
              Ready to Discover Your Next Favorite Restaurant?
            </h2>
            <p className="text-responsive text-neutral-600 mb-8">
              Join thousands of food lovers who trust TableTrek for their dining experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/"
                className="btn-primary px-8 py-4 text-lg inline-flex items-center justify-center"
              >
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/register"
                className="btn-outline px-8 py-4 text-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMore;

