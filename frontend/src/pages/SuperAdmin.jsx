import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Users, 
  Building2, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      // Redirect non-admin users
      window.location.href = '/';
      return;
    }
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchRestaurants(),
        fetchBookings(),
        fetchStats()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="loading-spinner"></div>
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
              <h1 className="text-3xl font-display font-bold text-neutral-800 flex items-center">
                <Shield className="h-8 w-8 text-primary-600 mr-3" />
                Super Admin Dashboard
              </h1>
              <p className="text-neutral-600 mt-2">
                System-wide management and control
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                Admin Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-fluid">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'restaurants', label: 'Restaurants', icon: Building2 },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'system', label: 'System', icon: Settings }
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
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} users={users} restaurants={restaurants} bookings={bookings} />
        )}
        {activeTab === 'users' && (
          <UsersTab users={users} onUsersUpdate={fetchUsers} />
        )}
        {activeTab === 'restaurants' && (
          <RestaurantsTab restaurants={restaurants} onRestaurantsUpdate={fetchRestaurants} />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} onBookingsUpdate={fetchBookings} />
        )}
        {activeTab === 'system' && (
          <SystemTab />
        )}
      </div>
    </div>
  );
};

const DashboardTab = ({ stats, users, restaurants, bookings }) => {
  const dashboardStats = [
    {
      label: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      label: 'Active Restaurants',
      value: restaurants.filter(r => r.isActive).length,
      icon: Building2,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: Calendar,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      label: 'Today\'s Bookings',
      value: bookings.filter(b => {
        const bookingDate = new Date(b.startTime).toDateString();
        const today = new Date().toDateString();
        return bookingDate === today;
      }).length,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentUsers = users.slice(-5).reverse();
  const recentRestaurants = restaurants.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="card-premium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card-premium">
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
            Recent Users
          </h3>
          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-800">{user.name}</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' 
                        ? 'bg-error-100 text-error-800'
                        : user.role === 'RESTAURANT_OWNER'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">No users found</p>
          )}
        </div>

        {/* Recent Restaurants */}
        <div className="card-premium">
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
            Recent Restaurants
          </h3>
          {recentRestaurants.length > 0 ? (
            <div className="space-y-4">
              {recentRestaurants.map(restaurant => (
                <div key={restaurant.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-800">{restaurant.name}</p>
                    <p className="text-sm text-neutral-600">{restaurant.city}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.isActive 
                        ? 'bg-success-100 text-success-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">No restaurants found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ users, onUsersUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        onUsersUpdate();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setNewUser({ name: '', email: '', password: '', role: 'USER' });
        setShowAddUser(false);
        onUsersUpdate();
        alert('User created successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        onUsersUpdate();
        alert('User deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          User Management
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowAddUser(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="USER">Users</option>
            <option value="RESTAURANT_OWNER">Restaurant Owners</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form onSubmit={createUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                  minLength="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="USER">User</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Create User</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddUser(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">User</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-neutral-100">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-neutral-800">{user.name}</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                    className="text-sm border border-neutral-300 rounded px-2 py-1"
                  >
                    <option value="USER">User</option>
                    <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-neutral-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="text-primary-600 hover:text-primary-700">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RestaurantsTab = ({ restaurants, onRestaurantsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && restaurant.isActive) ||
                         (statusFilter === 'inactive' && !restaurant.isActive);
    return matchesSearch && matchesStatus;
  });

  const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        onRestaurantsUpdate();
      }
    } catch (error) {
      console.error('Error updating restaurant status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Restaurant Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Restaurant</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map(restaurant => (
                <tr key={restaurant.id} className="border-b border-neutral-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-800">{restaurant.name}</p>
                      {restaurant.cuisine && (
                        <p className="text-sm text-neutral-600">{restaurant.cuisine}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-neutral-800">{restaurant.owner?.name || 'N/A'}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-neutral-800">{restaurant.city}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.isActive 
                        ? 'bg-success-100 text-success-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {restaurant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-neutral-600">
                      {new Date(restaurant.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.isActive)}
                        className={restaurant.isActive ? "text-error-600 hover:text-error-700" : "text-success-600 hover:text-success-700"}
                      >
                        {restaurant.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const BookingsTab = ({ bookings, onBookingsUpdate }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    return statusFilter === 'all' || booking.status === statusFilter;
  });

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

      <div className="card-premium">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Restaurant</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Date & Time</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Party Size</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="border-b border-neutral-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-neutral-800">{booking.user?.name}</p>
                      <p className="text-sm text-neutral-600">{booking.user?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-neutral-800">{booking.restaurant?.name}</p>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-success-100 text-success-800'
                        : booking.status === 'CANCELLED'
                        ? 'bg-error-100 text-error-800'
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-700">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SystemTab = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-display font-bold text-neutral-800">
        System Settings
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium">
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span className="font-medium text-success-800">Database</span>
              </div>
              <span className="text-success-600 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span className="font-medium text-success-800">Redis Cache</span>
              </div>
              <span className="text-success-600 text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span className="font-medium text-success-800">Email Service</span>
              </div>
              <span className="text-success-600 text-sm">Active</span>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-6">
            System Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full btn-secondary text-left">
              <Settings className="h-5 w-5 mr-3" />
              View System Logs
            </button>
            <button className="w-full btn-secondary text-left">
              <BarChart3 className="h-5 w-5 mr-3" />
              Generate Reports
            </button>
            <button className="w-full btn-secondary text-left">
              <AlertTriangle className="h-5 w-5 mr-3" />
              System Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
