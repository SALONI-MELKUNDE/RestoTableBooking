import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, MapPin, X, Star } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/users/${user.id}/bookings`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setCancelling(bookingId);
      await api.patch(`/bookings/${bookingId}/cancel`);
      
      // Update the booking in the local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'CANCELLED' }
          : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewForm({ rating: 5, text: '' });
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setSubmittingReview(true);
      await api.post(`/restaurants/${selectedBooking.restaurant.id}/reviews`, {
        rating: reviewForm.rating,
        text: reviewForm.text
      });
      
      // Update the booking to mark as reviewed
      setBookings(bookings.map(booking => 
        booking.id === selectedBooking.id 
          ? { ...booking, hasReview: true }
          : booking
      ));
      
      setShowReviewModal(false);
      alert('Review submitted successfully!');
    } catch (error) {
  console.error('Error submitting review:', error);
  const data = error?.response?.data;
  const msg =
    (data && (data.message || data.error || data.msg ||
      (Array.isArray(data.errors) && data.errors[0]?.message))) ||
    (typeof data === 'string' ? data : null) ||
    (error?.message?.includes('Network') ? 'Network error — please try again.' : null) ||
    'Failed to submit review';
  alert(msg);
} finally {
  setSubmittingReview(false);
}

  };

  const isBookingCompleted = (booking) => {
    const bookingEndTime = new Date(booking.endTime);
    const now = new Date();
    return booking.status === 'CONFIRMED' && bookingEndTime < now;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {user.name}</p>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                {user.phone && <p><span className="font-medium">Phone:</span> {user.phone}</p>}
                <p><span className="font-medium">Role:</span> {user.role}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Statistics</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total Bookings:</span> {bookings.length}</p>
                <p><span className="font-medium">Confirmed Bookings:</span> {bookings.filter(b => b.status === 'CONFIRMED').length}</p>
                <p><span className="font-medium">Cancelled Bookings:</span> {bookings.filter(b => b.status === 'CANCELLED').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.restaurant.name}
                      </h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{booking.restaurant.city}</span>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{formatDate(booking.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span>{booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>
                  
                  {booking.table && (
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Table:</span> {booking.table.label} ({booking.table.seats} seats)
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3">
                    {booking.status === 'CONFIRMED' && !isBookingCompleted(booking) && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        disabled={cancelling === booking.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling === booking.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        <span>Cancel Booking</span>
                      </button>
                    )}
                    
                    {isBookingCompleted(booking) && !booking.hasReview && (
                      <button
                        onClick={() => openReviewModal(booking)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Star className="h-4 w-4" />
                        <span>Leave Review</span>
                      </button>
                    )}
                    
                    {booking.hasReview && (
                      <span className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                        <Star className="h-4 w-4" />
                        <span>Review Submitted</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-bold mb-4">
                Review {selectedBooking.restaurant.name}
              </h3>
              
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className={`text-2xl ${
                          star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="4"
                    placeholder="Share your experience..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;




