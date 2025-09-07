import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Menu, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Globe, 
  Clock,
  DollarSign,
  Star
} from 'lucide-react';

const RestaurantAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenus();
      fetchBookings();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      const userRestaurants = data.restaurants.filter(r => r.ownerId === user.id);
      setRestaurants(userRestaurants);
      if (userRestaurants.length > 0) {
        setSelectedRestaurant(userRestaurants[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setLoading(false);
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await fetch(`/api/menus/restaurant/${selectedRestaurant.id}`);
      const data = await response.json();
      setMenus(data.menus || []);
    } catch (error) {
      console.error('Error fetching menus:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/restaurant/${selectedRestaurant.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="container-fluid py-16">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-4">
            No Restaurants Found
          </h2>
          <p className="text-neutral-600 mb-8">
            You don't have any restaurants registered yet. Contact support to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-fluid py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-800">
                Restaurant Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage your restaurant operations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedRestaurant?.id || ''}
                onChange={(e) => {
                  const restaurant = restaurants.find(r => r.id === e.target.value);
                  setSelectedRestaurant(restaurant);
                }}
                className="select-field"
              >
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-fluid">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'menus', label: 'Menus', icon: Menu },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container-fluid py-8">
        {activeTab === 'overview' && (
          <OverviewTab restaurant={selectedRestaurant} bookings={bookings} />
        )}
        {activeTab === 'menus' && (
          <MenusTab restaurant={selectedRestaurant} menus={menus} onMenusUpdate={fetchMenus} />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab restaurant={selectedRestaurant} bookings={bookings} onBookingsUpdate={fetchBookings} />
        )}
        {activeTab === 'settings' && (
          <SettingsTab restaurant={selectedRestaurant} onRestaurantUpdate={fetchRestaurants} />
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ restaurant, bookings }) => {
  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  });

  const stats = [
    {
      label: 'Today\'s Bookings',
      value: todayBookings.length,
      icon: Calendar,
      color: 'text-primary-600'
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: Users,
      color: 'text-success-600'
    },
    {
      label: 'Average Rating',
      value: restaurant.reviews?.length > 0 
        ? (restaurant.reviews.reduce((sum, r) => sum + r.rating, 0) / restaurant.reviews.length).toFixed(1)
        : 'N/A',
      icon: Star,
      color: 'text-warning-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-premium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Restaurant Info */}
      <div className="card-premium">
        <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
          Restaurant Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-neutral-400 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-800">Address</p>
                <p className="text-neutral-600">
                  {restaurant.address}<br />
                  {restaurant.city}, {restaurant.state} {restaurant.zipCode}
                </p>
              </div>
            </div>
            {restaurant.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-800">Phone</p>
                  <p className="text-neutral-600">{restaurant.phone}</p>
                </div>
              </div>
            )}
            {restaurant.website && (
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-800">Website</p>
                  <a href={restaurant.website} className="text-primary-600 hover:text-primary-700">
                    {restaurant.website}
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-neutral-400" />
              <div>
                <p className="font-medium text-neutral-800">Hours</p>
                <p className="text-neutral-600">
                  {restaurant.openingTime} - {restaurant.closingTime}
                </p>
              </div>
            </div>
            {restaurant.cuisine && (
              <div>
                <p className="font-medium text-neutral-800">Cuisine</p>
                <p className="text-neutral-600">{restaurant.cuisine}</p>
              </div>
            )}
            {restaurant.priceRange && (
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-800">Price Range</p>
                  <p className="text-neutral-600">{restaurant.priceRange}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card-premium">
        <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
          Recent Bookings
        </h3>
        {todayBookings.length > 0 ? (
          <div className="space-y-4">
            {todayBookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-800">{booking.user.name}</p>
                  <p className="text-sm text-neutral-600">
                    {new Date(booking.startTime).toLocaleTimeString()} - Party of {booking.partySize}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'CONFIRMED' 
                    ? 'bg-success-100 text-success-800'
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-600">No bookings for today</p>
        )}
      </div>
    </div>
  );
};

const MenusTab = ({ restaurant, menus, onMenusUpdate }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [newMenu, setNewMenu] = useState({ name: '', description: '' });
  const [newItem, setNewItem] = useState({ 
    name: '', description: '', price: '', category: 'APPETIZER', 
    imageUrl: '', ingredients: '', allergens: '', available: true 
  });

  const createMenu = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newMenu)
      });

      if (response.ok) {
        setNewMenu({ name: '', description: '' });
        setShowAddMenu(false);
        onMenusUpdate();
        alert('Menu created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create menu');
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      alert('Failed to create menu');
    }
  };

  const createMenuItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/menus/${selectedMenu.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price)
        })
      });

      if (response.ok) {
        setNewItem({ 
          name: '', description: '', price: '', category: 'APPETIZER', 
          imageUrl: '', ingredients: '', allergens: '', available: true 
        });
        setShowAddItem(false);
        onMenusUpdate();
        alert('Menu item added successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item');
    }
  };

  const updateMenuItem = async (itemId, updates) => {
    try {
      const response = await fetch(`/api/menus/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        onMenusUpdate();
        alert('Menu item updated successfully!');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      const response = await fetch(`/api/menus/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        onMenusUpdate();
        alert('Menu item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Menu Management
        </h2>
        <button
          onClick={() => setShowAddMenu(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Menu</span>
        </button>
      </div>

      {/* Add Menu Modal */}
      {showAddMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New Menu</h3>
            <form onSubmit={createMenu} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Menu Name</label>
                <input
                  type="text"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Dinner Menu, Lunch Specials"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newMenu.description}
                  onChange={(e) => setNewMenu({...newMenu, description: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Brief description of this menu"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Create Menu</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddMenu(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Add Menu Item to {selectedMenu?.name}</h3>
            <form onSubmit={createMenuItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="APPETIZER">Appetizer</option>
                    <option value="MAIN_COURSE">Main Course</option>
                    <option value="DESSERT">Dessert</option>
                    <option value="BEVERAGE">Beverage</option>
                    <option value="SIDE">Side</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                <input
                  type="text"
                  value={newItem.ingredients}
                  onChange={(e) => setNewItem({...newItem, ingredients: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Comma-separated ingredients"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Allergens</label>
                <input
                  type="text"
                  value={newItem.allergens}
                  onChange={(e) => setNewItem({...newItem, allergens: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Nuts, Dairy, Gluten"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available"
                  checked={newItem.available}
                  onChange={(e) => setNewItem({...newItem, available: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="available" className="text-sm font-medium">Available</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Add Item</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddItem(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menus Display */}
      {menus.length > 0 ? (
        <div className="space-y-6">
          {menus.map(menu => (
            <div key={menu.id} className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-neutral-800">{menu.name}</h3>
                  <p className="text-neutral-600">{menu.description}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMenu(menu);
                    setShowAddItem(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Menu Items */}
              {menu.items && menu.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menu.items.map(item => (
                    <div key={item.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-neutral-800">{item.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.category === 'APPETIZER' ? 'bg-blue-100 text-blue-800' :
                              item.category === 'MAIN_COURSE' ? 'bg-green-100 text-green-800' :
                              item.category === 'DESSERT' ? 'bg-pink-100 text-pink-800' :
                              item.category === 'BEVERAGE' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
                          {item.ingredients && (
                            <p className="text-xs text-neutral-500 mt-1">
                              <strong>Ingredients:</strong> {item.ingredients}
                            </p>
                          )}
                          {item.allergens && (
                            <p className="text-xs text-red-600 mt-1">
                              <strong>Allergens:</strong> {item.allergens}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-primary-600">${item.price}</p>
                          <div className="flex items-center space-x-1 mt-2">
                            <button
                              onClick={() => updateMenuItem(item.id, { available: !item.available })}
                              className={`px-2 py-1 text-xs rounded ${
                                item.available 
                                  ? 'bg-success-100 text-success-800' 
                                  : 'bg-error-100 text-error-800'
                              }`}
                            >
                              {item.available ? 'Available' : 'Unavailable'}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                        {item.imageUrl && (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="flex items-center space-x-2 ml-auto">
                          <button 
                            onClick={() => {
                              setSelectedItem(item);
                              setShowEditItem(true);
                            }}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteMenuItem(item.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-4">No items in this menu yet</p>
                  <button
                    onClick={() => {
                      setSelectedMenu(menu);
                      setShowAddItem(true);
                    }}
                    className="btn-primary"
                  >
                    Add First Item
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-4">
            No Menus Yet
          </h3>
          <p className="text-neutral-600 mb-8">
            Create your first menu to start showcasing your delicious offerings to customers.
          </p>
          <button 
            onClick={() => setShowAddMenu(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create First Menu</span>
          </button>
        </div>
      )}
    </div>
  );
};

const BookingsTab = ({ restaurant, bookings, onBookingsUpdate }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    return statusFilter === 'all' || booking.status === statusFilter;
  });

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/restaurants/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        onBookingsUpdate();
        alert(`Booking ${status.toLowerCase()} successfully!`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Booking Management
        </h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field"
        >
          <option value="all">All Bookings</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="card-premium">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Party Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Table</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">{booking.user.name}</p>
                        <p className="text-sm text-neutral-600">{booking.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-neutral-600">
                          {new Date(booking.startTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800">{booking.partySize}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800">
                        {booking.table?.label || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'CONFIRMED' ? 'bg-success-100 text-success-800' :
                        booking.status === 'PENDING' ? 'bg-warning-100 text-warning-800' :
                        'bg-error-100 text-error-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              className="text-success-600 hover:text-success-700"
                              title="Approve booking"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                              className="text-error-600 hover:text-error-700"
                              title="Reject booking"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {booking.status !== 'PENDING' && (
                          <span className="text-neutral-400 text-sm">
                            {booking.status === 'CONFIRMED' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h3 className="text-xl font-display font-semibold text-neutral-800 mb-2">
            No Bookings Found
          </h3>
          <p className="text-neutral-600">
            No bookings match the selected filter.
          </p>
        </div>
      )}
    </div>
  );
};

const SettingsTab = ({ restaurant, onRestaurantUpdate }) => {
  const [formData, setFormData] = useState({
    name: restaurant.name || '',
    address: restaurant.address || '',
    city: restaurant.city || '',
    state: restaurant.state || '',
    zipCode: restaurant.zipCode || '',
    country: restaurant.country || 'USA',
    phone: restaurant.phone || '',
    website: restaurant.website || '',
    description: restaurant.description || '',
    cuisine: restaurant.cuisine || '',
    priceRange: restaurant.priceRange || 'MODERATE',
    openingTime: restaurant.openingTime || '09:00',
    closingTime: restaurant.closingTime || '22:00'
  });
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ label: '', seats: 2 });
  const [showAddTable, setShowAddTable] = useState(false);

  useEffect(() => {
    if (restaurant.tables) {
      setTables(restaurant.tables);
    }
  }, [restaurant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onRestaurantUpdate();
        alert('Restaurant updated successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update restaurant');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to update restaurant');
    }
  };

  const addTable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newTable)
      });

      if (response.ok) {
        const table = await response.json();
        setTables([...tables, table]);
        setNewTable({ label: '', seats: 2 });
        setShowAddTable(false);
        alert('Table added successfully!');
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-bold text-neutral-800">
        Restaurant Settings
      </h2>

      <form onSubmit={handleSubmit} className="card-premium space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Cuisine Type
            </label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Italian, Mexican, Asian"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows="3"
            placeholder="Brief description of your restaurant"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              placeholder="123 Main St"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input-field"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input-field"
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="input-field"
              placeholder="10001"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="input-field"
              placeholder="https://"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Price Range
            </label>
            <select
              name="priceRange"
              value={formData.priceRange}
              onChange={handleChange}
              className="select-field"
            >
              <option value="">Select range</option>
              <option value="$">$ - Budget friendly</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Expensive</option>
              <option value="$$$$">$$$$ - Very expensive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Opening Time
            </label>
            <input
              type="time"
              name="openingTime"
              value={formData.openingTime}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Closing Time
            </label>
            <input
              type="time"
              name="closingTime"
              value={formData.closingTime}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">
            Update Restaurant
          </button>
        </div>
      </form>

      {/* Table Management */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-neutral-800">
            Table Management
          </h3>
          <button
            onClick={() => setShowAddTable(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Table</span>
          </button>
        </div>

        {/* Add Table Modal */}
        {showAddTable && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Add New Table</h3>
              <form onSubmit={addTable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Table Label</label>
                  <input
                    type="text"
                    value={newTable.label}
                    onChange={(e) => setNewTable({...newTable, label: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Table 1, Window Table, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTable.seats}
                    onChange={(e) => setNewTable({...newTable, seats: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">Add Table</button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddTable(false)}
                    className="btn-outline flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-800">{table.label}</h4>
                  <p className="text-sm text-neutral-600">{table.seats} seats</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-primary-600 hover:text-primary-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-error-600 hover:text-error-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tables.length === 0 && (
            <div className="col-span-full text-center py-8 text-neutral-500">
              No tables added yet. Add your first table to start accepting bookings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantAdmin;
