import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, 
  Users, 
  Calendar, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Clock,
  MapPin,
  Phone,
  Globe,
  ChefHat,
  Star
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [menus, setMenus] = useState([]);

  // Form states
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showTableForm, setShowTableForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [selectedMenuForItem, setSelectedMenuForItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'menu', 'menuItem', or 'restaurant'
  
  // Set the first restaurant as selected when restaurants are loaded
  useEffect(() => {
    if (restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0]);
    }
  }, [restaurants]);
  
  const [restaurantForm, setRestaurantForm] = useState({
    name: '', address: '', city: '', state: '', zipCode: '', country: 'USA',
    phone: '', website: '', description: '', cuisine: '', priceRange: '$',
    openingTime: '09:00', closingTime: '22:00'
  });
  const [tableForm, setTableForm] = useState({ label: '', seats: 2 });
  const [menuForm, setMenuForm] = useState({ name: '', description: '', restaurantId: '' });
  const [menuItemForm, setMenuItemForm] = useState({
    name: '', description: '', price: '', category: 'MAIN_COURSE',
    ingredients: '', allergens: '', available: true
  });

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTables();
      fetchBookings();
      fetchMenus();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/restaurants', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      const userRestaurants = Array.isArray(data) ? data.filter(r => r.ownerId === user.id) : [];
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

  const fetchTables = async () => {
    if (!selectedRestaurant?.id) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/tables`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  const fetchBookings = async () => {
    if (!selectedRestaurant?.id) {
      setBookings([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/bookings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (!response.ok) {
        console.error('Booking fetch failed:', response.status, response.statusText);
        setBookings([]);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched bookings:', data);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const fetchMenus = async () => {
    if (!selectedRestaurant?.id) {
      setMenus([]);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/menus`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await response.json();
      console.log('Fetched menus:', data);
      setMenus(data.menus || []);
    } catch (error) {
      console.error('Error fetching menus:', error);
      setMenus([]);
    }
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(restaurantForm)
      });
      
      if (response.ok) {
        setShowRestaurantForm(false);
        setEditingRestaurant(null);
        resetRestaurantForm();
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
    }
  };

  const updateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${editingRestaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(restaurantForm)
      });
      
      if (response.ok) {
        setShowRestaurantForm(false);
        setEditingRestaurant(null);
        resetRestaurantForm();
        fetchRestaurants();
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  };

  const resetRestaurantForm = () => {
    setRestaurantForm({
      name: '', address: '', city: '', state: '', zipCode: '', country: 'USA',
      phone: '', website: '', description: '', cuisine: '', priceRange: '$',
      openingTime: '09:00', closingTime: '22:00', lat: '', lon: ''
    });
  };

  const editRestaurant = (restaurant) => {
    setRestaurantForm({
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
      priceRange: restaurant.priceRange || '$',
      openingTime: restaurant.openingTime || '09:00',
      closingTime: restaurant.closingTime || '22:00',
      lat: restaurant.lat || '',
      lon: restaurant.lon || ''
    });
    setEditingRestaurant(restaurant);
    setShowRestaurantForm(true);
  };

  const createMenu = async (e) => {
    e.preventDefault();
    
    // Use the restaurant ID from the dropdown, or fall back to selected restaurant
    const targetRestaurantId = menuForm.restaurantId || selectedRestaurant?.id;
    
    console.log('Creating menu with:', {
      targetRestaurantId,
      menuForm,
      selectedRestaurant: selectedRestaurant?.id
    });
    
    if (!targetRestaurantId) {
      alert('Please select a restaurant first');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${targetRestaurantId}/menus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          name: menuForm.name,
          description: menuForm.description,
          restaurantId: targetRestaurantId
        })
      });
      
      const responseData = await response.json();
      console.log('Menu creation response:', responseData);
      
      if (response.ok) {
        setShowMenuForm(false);
        setEditingMenu(null);
        setMenuForm({ name: '', description: '', restaurantId: '' });
        // Refresh both restaurants (to get updated menu counts) and menus
        fetchRestaurants();
        // Always refresh menus and switch to the restaurant where menu was created
        if (targetRestaurantId !== selectedRestaurant?.id) {
          // Switch to the restaurant where the menu was created
          const targetRestaurant = restaurants.find(r => r.id === targetRestaurantId);
          if (targetRestaurant) {
            setSelectedRestaurant(targetRestaurant);
          }
        }
        // Always refresh menus after creation
        setTimeout(() => {
          fetchMenus();
        }, 500);
        // Show success message with restaurant name
        const targetRestaurantName = restaurants.find(r => r.id === targetRestaurantId)?.name || 'restaurant';
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `✅ Menu created successfully for ${targetRestaurantName}! Switching to menu tab...`;
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500 animate-pulse';
        successMsg.style.fontSize = '16px';
        successMsg.style.fontWeight = 'bold';
        successMsg.style.maxWidth = '400px';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.opacity = '0';
          successMsg.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(successMsg)) {
              document.body.removeChild(successMsg);
            }
          }, 500);
        }, 5000);
      } else {
        console.error('Menu creation failed:', responseData);
        // Show error message for longer duration
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = '❌ ' + (responseData.message || 'Failed to create menu');
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500';
        errorMsg.style.fontSize = '16px';
        errorMsg.style.fontWeight = 'bold';
        document.body.appendChild(errorMsg);
        setTimeout(() => {
          errorMsg.style.opacity = '0';
          errorMsg.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(errorMsg)) {
              document.body.removeChild(errorMsg);
            }
          }, 500);
        }, 6000);
      }
    } catch (error) {
      console.error('Error creating menu:', error);
      alert('Network error while creating menu');
    }
  };

  const updateMenu = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/menus/${editingMenu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(menuForm)
      });
      
      if (response.ok) {
        setShowMenuForm(false);
        setEditingMenu(null);
        setMenuForm({ name: '', description: '' });
        fetchMenus();
      }
    } catch (error) {
      console.error('Error updating menu:', error);
    }
  };

  const deleteMenu = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/menus/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (response.ok) {
        fetchMenus();
        setShowDeleteModal(false);
        setItemToDelete(null);
        setDeleteType('');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const editMenu = (menu) => {
    setMenuForm({ name: menu.name, description: menu.description, restaurantId: menu.restaurantId });
    setEditingMenu(menu);
    setShowMenuForm(true);
  };

  const confirmDeleteMenu = (menu) => {
    setItemToDelete(menu);
    setDeleteType('menu');
    setShowDeleteModal(true);
  };

  const createMenuItem = async (e) => {
    e.preventDefault();
    if (!selectedMenuForItem) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/menus/${selectedMenuForItem.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(menuItemForm)
      });
      
      if (response.ok) {
        setShowMenuItemForm(false);
        setEditingMenuItem(null);
        setSelectedMenuForItem(null);
        resetMenuItemForm();
        fetchMenus();
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
    }
  };

  const updateMenuItem = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/menu-items/${editingMenuItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(menuItemForm)
      });
      
      if (response.ok) {
        setShowMenuItemForm(false);
        setEditingMenuItem(null);
        setSelectedMenuForItem(null);
        resetMenuItemForm();
        fetchMenus();
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const deleteMenuItem = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/menu-items/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (response.ok) {
        fetchMenus();
        setShowDeleteModal(false);
        setItemToDelete(null);
        setDeleteType('');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  const confirmDeleteMenuItem = (item) => {
    setItemToDelete(item);
    setDeleteType('menuItem');
    setShowDeleteModal(true);
  };

  const confirmDeleteRestaurant = (restaurant) => {
    setItemToDelete(restaurant);
    setDeleteType('restaurant');
    setShowDeleteModal(true);
  };

  const deleteRestaurant = async () => {
    if (!itemToDelete) return;
    
    try {
      console.log('Deleting restaurant:', itemToDelete.id);
      const response = await fetch(`http://localhost:3000/api/restaurants/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `✅ Restaurant "${itemToDelete.name}" deleted successfully!`;
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500';
        successMsg.style.fontSize = '16px';
        successMsg.style.fontWeight = 'bold';
        successMsg.style.maxWidth = '400px';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.opacity = '0';
          successMsg.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(successMsg)) {
              document.body.removeChild(successMsg);
            }
          }, 500);
        }, 4000);
        
        fetchRestaurants();
        setShowDeleteModal(false);
        setItemToDelete(null);
        setDeleteType('');
        // If deleted restaurant was selected, clear selection
        if (selectedRestaurant?.id === itemToDelete.id) {
          setSelectedRestaurant(restaurants.length > 1 ? restaurants.find(r => r.id !== itemToDelete.id) : null);
        }
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.innerHTML = `❌ Failed to delete restaurant: ${errorData.message || 'Unknown error'}`;
        errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500';
        errorMsg.style.fontSize = '16px';
        errorMsg.style.fontWeight = 'bold';
        errorMsg.style.maxWidth = '400px';
        document.body.appendChild(errorMsg);
        setTimeout(() => {
          errorMsg.style.opacity = '0';
          errorMsg.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(errorMsg)) {
              document.body.removeChild(errorMsg);
            }
          }, 500);
        }, 6000);
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.innerHTML = `❌ Network error while deleting restaurant`;
      errorMsg.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500';
      errorMsg.style.fontSize = '16px';
      errorMsg.style.fontWeight = 'bold';
      errorMsg.style.maxWidth = '400px';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.opacity = '0';
        errorMsg.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(errorMsg)) {
            document.body.removeChild(errorMsg);
          }
        }, 500);
      }, 6000);
    }
  };

  const editMenuItem = (item, menu) => {
    setMenuItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      ingredients: item.ingredients || '',
      allergens: item.allergens || '',
      available: item.available
    });
    setEditingMenuItem(item);
    setSelectedMenuForItem(menu);
    setShowMenuItemForm(true);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: '', description: '', price: '', category: 'MAIN_COURSE',
      ingredients: '', allergens: '', available: true
    });
  };

  const createTable = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(tableForm)
      });
      
      if (response.ok) {
        setShowTableForm(false);
        setTableForm({ label: '', seats: 2 });
        fetchTables();
      }
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const updateTable = async (tableId, updates) => {
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const deleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/${selectedRestaurant.id}/tables/${tableId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (response.ok) {
        fetchTables();
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/restaurants/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Building2 },
    { id: 'restaurants', name: 'Restaurants', icon: Building2 },
    { id: 'tables', name: 'Tables', icon: Users },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'menus', name: 'Menus', icon: ChefHat }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Restaurants</p>
            <p className="text-2xl font-semibold text-gray-900">{restaurants.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Tables</p>
            <p className="text-2xl font-semibold text-gray-900">{tables.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <Calendar className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Bookings</p>
            <p className="text-2xl font-semibold text-gray-900">{bookings.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <ChefHat className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Menu Items</p>
            <p className="text-2xl font-semibold text-gray-900">
              {menus.reduce((total, menu) => total + (menu.items?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Restaurants</h2>
        <button
          onClick={() => setShowRestaurantForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Restaurant
        </button>
      </div>

      {showRestaurantForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h3>
          <form onSubmit={editingRestaurant ? updateRestaurant : createRestaurant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Restaurant Name"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={restaurantForm.address}
              onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={restaurantForm.city}
              onChange={(e) => setRestaurantForm({...restaurantForm, city: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={restaurantForm.phone}
              onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Cuisine Type"
              value={restaurantForm.cuisine}
              onChange={(e) => setRestaurantForm({...restaurantForm, cuisine: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <select
              value={restaurantForm.priceRange}
              onChange={(e) => setRestaurantForm({...restaurantForm, priceRange: e.target.value})}
              className="border rounded-lg px-3 py-2"
            >
              <option value="$">$ - Budget</option>
              <option value="$$">$$ - Moderate</option>
              <option value="$$$">$$$ - Expensive</option>
              <option value="$$$$">$$$$ - Very Expensive</option>
            </select>
            <input
              type="time"
              value={restaurantForm.openingTime}
              onChange={(e) => setRestaurantForm({...restaurantForm, openingTime: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="time"
              value={restaurantForm.closingTime}
              onChange={(e) => setRestaurantForm({...restaurantForm, closingTime: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g., 40.7128)"
              value={restaurantForm.lat}
              onChange={(e) => setRestaurantForm({...restaurantForm, lat: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g., -74.0060)"
              value={restaurantForm.lon}
              onChange={(e) => setRestaurantForm({...restaurantForm, lon: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <div className="md:col-span-2">
              <textarea
                placeholder="Description"
                value={restaurantForm.description}
                onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                className="border rounded-lg px-3 py-2 w-full"
                rows="3"
              />
            </div>
            <div className="md:col-span-2 text-sm text-gray-600">
              <p>💡 <strong>Tip:</strong> To get coordinates, search for your restaurant on Google Maps, right-click on the location, and copy the latitude and longitude values.</p>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editingRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRestaurantForm(false);
                  setEditingRestaurant(null);
                  resetRestaurantForm();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{restaurant.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {restaurant.address}, {restaurant.city}
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {restaurant.phone}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {restaurant.openingTime} - {restaurant.closingTime}
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                {restaurant.cuisine || 'Not specified'}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-semibold text-green-600">{restaurant.priceRange}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => editRestaurant(restaurant)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDeleteRestaurant(restaurant)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTables = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Tables - {selectedRestaurant?.name || 'Select a restaurant'}
        </h2>
        {selectedRestaurant && (
          <button
            onClick={() => setShowTableForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Table
          </button>
        )}
      </div>

      {showTableForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add New Table</h3>
          <form onSubmit={createTable} className="flex gap-4">
            <input
              type="text"
              placeholder="Table Label (e.g., T1, VIP1)"
              value={tableForm.label}
              onChange={(e) => setTableForm({...tableForm, label: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="number"
              placeholder="Seats"
              min="1"
              max="20"
              value={tableForm.seats}
              onChange={(e) => setTableForm({...tableForm, seats: parseInt(e.target.value)})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Add Table
            </button>
            <button
              type="button"
              onClick={() => setShowTableForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {selectedRestaurant ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{table.label}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingTable(table.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteTable(table.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600">Seats: {table.seats}</p>
              <div className="mt-2">
                <button
                  onClick={() => updateTable(table.id, { isActive: !table.isActive })}
                  className={`px-3 py-1 rounded text-sm ${
                    table.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {table.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Please select a restaurant to manage tables.</p>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Bookings - {selectedRestaurant?.name || 'Select a restaurant'}
      </h2>

      {selectedRestaurant ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.user?.name}</div>
                        <div className="text-sm text-gray-500">{booking.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.startTime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.partySize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Please select a restaurant to view bookings.</p>
          <p className="text-sm text-gray-400">Use the dropdown at the top to select a restaurant first.</p>
        </div>
      )}
    </div>
  );

  const renderMenus = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Menus - {selectedRestaurant?.name || 'Select a restaurant'}
        </h2>
        <button
          onClick={() => setShowMenuForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Menu
        </button>
      </div>

      {showMenuForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingMenu ? 'Edit Menu' : 'Add New Menu'}
          </h3>
          <form onSubmit={editingMenu ? updateMenu : createMenu} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Restaurant
              </label>
              <select
                value={menuForm.restaurantId || selectedRestaurant?.id || ''}
                onChange={(e) => {
                  console.log('Restaurant dropdown changed to:', e.target.value);
                  setMenuForm({...menuForm, restaurantId: e.target.value});
                }}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Choose a restaurant...</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Menu Name (e.g., Dinner Menu, Lunch Specials)"
              value={menuForm.name}
              onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <textarea
              placeholder="Menu Description"
              value={menuForm.description}
              onChange={(e) => setMenuForm({...menuForm, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 h-24"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editingMenu ? 'Update Menu' : 'Create Menu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenuForm(false);
                  setEditingMenu(null);
                  setMenuForm({ name: '', description: '', restaurantId: '' });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showMenuItemForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {editingMenuItem ? 'Edit Menu Item' : `Add Item to ${selectedMenuForItem?.name}`}
          </h3>
          <form onSubmit={editingMenuItem ? updateMenuItem : createMenuItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Item Name"
              value={menuItemForm.name}
              onChange={(e) => setMenuItemForm({...menuItemForm, name: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={menuItemForm.price}
              onChange={(e) => setMenuItemForm({...menuItemForm, price: e.target.value})}
              className="border rounded-lg px-3 py-2"
              required
            />
            <select
              value={menuItemForm.category}
              onChange={(e) => setMenuItemForm({...menuItemForm, category: e.target.value})}
              className="border rounded-lg px-3 py-2"
            >
              <option value="APPETIZER">Appetizer</option>
              <option value="MAIN_COURSE">Main Course</option>
              <option value="DESSERT">Dessert</option>
              <option value="BEVERAGE">Beverage</option>
              <option value="SIDE">Side Dish</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={menuItemForm.available}
                onChange={(e) => setMenuItemForm({...menuItemForm, available: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="available" className="text-sm">Available</label>
            </div>
            <div className="md:col-span-2">
              <textarea
                placeholder="Description"
                value={menuItemForm.description}
                onChange={(e) => setMenuItemForm({...menuItemForm, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
                rows="2"
              />
            </div>
            <input
              type="text"
              placeholder="Ingredients (optional)"
              value={menuItemForm.ingredients}
              onChange={(e) => setMenuItemForm({...menuItemForm, ingredients: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Allergens (optional)"
              value={menuItemForm.allergens}
              onChange={(e) => setMenuItemForm({...menuItemForm, allergens: e.target.value})}
              className="border rounded-lg px-3 py-2"
            />
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editingMenuItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMenuItemForm(false);
                  setEditingMenuItem(null);
                  setSelectedMenuForItem(null);
                  resetMenuItemForm();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRestaurant ? (
        <div className="space-y-6">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{menu.name}</h3>
                  <p className="text-gray-600">{menu.description}</p>
                  <p className="text-sm text-blue-600 font-medium">Restaurant: {selectedRestaurant.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMenuForItem(menu);
                      setShowMenuItemForm(true);
                    }}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Add Item
                  </button>
                  <button
                    onClick={() => editMenu(menu)}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => confirmDeleteMenu(menu)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menu.items?.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editMenuItem(item, menu)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => confirmDeleteMenuItem(item)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-green-600">
                        ${item.price}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">
                        {item.category?.replace('_', ' ')}
                      </span>
                    </div>
                    {item.allergens && (
                      <div className="text-xs text-red-600 mt-1">
                        Allergens: {item.allergens}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {(!menu.items || menu.items.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No menu items yet. Click "Add Item" to get started.
                </div>
              )}
            </div>
          ))}
          
          {menus.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No menus created yet. Click "Add Menu" to get started.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Please select a restaurant to view menus.</p>
          <p className="text-sm text-gray-400">Use the dropdown at the top to select a restaurant first.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Admin Dashboard</h1>
            {selectedRestaurant && (
              <select
                value={selectedRestaurant.id}
                onChange={(e) => setSelectedRestaurant(restaurants.find(r => r.id === e.target.value))}
                className="border rounded-lg px-3 py-2"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              {deleteType === 'menu' 
                ? `Are you sure you want to delete the menu "${itemToDelete?.name}"? This will also delete all menu items in this menu.`
                : deleteType === 'menuItem'
                ? `Are you sure you want to delete the menu item "${itemToDelete?.name}"?`
                : `Are you sure you want to delete the restaurant "${itemToDelete?.name}"? This will also delete all menus, tables, and bookings associated with this restaurant.`
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                  setDeleteType('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteType === 'menu' ? deleteMenu : deleteType === 'menuItem' ? deleteMenuItem : deleteRestaurant}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'restaurants' && renderRestaurants()}
          {activeTab === 'tables' && renderTables()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'menus' && renderMenus()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
