import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Clock, Users, Phone, Mail, ChefHat, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import MenuDisplay from '../components/MenuDisplay';

const Restaurant = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data);
    } catch (error) {
      setError('Restaurant not found');
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to leave a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(reviewForm)
      });

      if (response.ok) {
        setShowReviewModal(false);
        setReviewForm({ rating: 5, text: '' });
        fetchRestaurant(); // Refresh to show new review
        alert('Review submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <Link to="/" className="btn-primary">
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {restaurant.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">
                    {getAverageRating(restaurant.reviews)}
                  </span>
                  <span className="text-gray-600">
                    ({restaurant.reviews?.length || 0} reviews)
                  </span>
                </div>
              </div>
              
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
              
              {isAuthenticated ? (
                <Link
                  to={`/booking/${restaurant.id}`}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Book a Table
                </Link>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-600">Please sign in to book a table</p>
                  <Link to="/login" className="btn-primary text-lg px-8 py-3">
                    Sign In to Book
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <MenuDisplay 
                restaurant={restaurant} 
                menus={restaurant.menus || []} 
                isLoading={loading} 
              />
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Write Review
                  </button>
                )}
              </div>
              
              {restaurant.reviews && restaurant.reviews.length > 0 ? (
                <div className="space-y-4">
                  {restaurant.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.user.name}
                        </span>
                      </div>
                      {review.text && (
                        <p className="text-gray-700 text-sm">{review.text}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  
                  {restaurant.reviews.length > 5 && (
                    <p className="text-sm text-gray-600 text-center">
                      And {restaurant.reviews.length - 5} more reviews...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No reviews yet.</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Be the first to review!
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Write a Review for {restaurant.name}</h3>
            <form onSubmit={submitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Share your experience..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setReviewForm({ rating: 5, text: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant;
