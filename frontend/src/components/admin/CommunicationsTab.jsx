import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Mail, 
  Smartphone, 
  Users, 
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Check,
  Clock
} from 'lucide-react';

const CommunicationsTab = ({ restaurant }) => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newMessage, setNewMessage] = useState({
    type: 'email',
    recipients: 'all',
    subject: '',
    message: '',
    scheduledFor: ''
  });
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchCustomers();
  }, [restaurant]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/customers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newMessage)
      });

      if (response.ok) {
        fetchNotifications();
        setNewMessage({
          type: 'email',
          recipients: 'all',
          subject: '',
          message: '',
          scheduledFor: ''
        });
        setShowCompose(false);
        alert('Notification sent successfully!');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    }
  };

  const notificationTemplates = [
    {
      id: 'booking_reminder',
      name: 'Booking Reminder',
      subject: 'Your reservation at {restaurant_name} is tomorrow',
      message: 'Hi {customer_name}, this is a friendly reminder about your reservation tomorrow at {time}. We look forward to serving you!'
    },
    {
      id: 'special_offer',
      name: 'Special Offer',
      subject: 'Special offer just for you!',
      message: 'Hi {customer_name}, we have a special offer for our valued customers. Book now and get 20% off your next meal!'
    },
    {
      id: 'feedback_request',
      name: 'Feedback Request',
      subject: 'How was your experience at {restaurant_name}?',
      message: 'Hi {customer_name}, thank you for dining with us. We would love to hear about your experience!'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Customer Communications
        </h2>
        <button
          onClick={() => setShowCompose(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Compose Message</span>
        </button>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex space-x-8">
          {[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'customers', label: 'Customer List', icon: Users },
            { id: 'templates', label: 'Templates', icon: MessageSquare }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeSection === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Compose Message</h3>
            <form onSubmit={sendNotification} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Message Type</label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({...newMessage, type: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Recipients</label>
                  <select
                    value={newMessage.recipients}
                    onChange={(e) => setNewMessage({...newMessage, recipients: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Customers</option>
                    <option value="recent">Recent Customers</option>
                    <option value="frequent">Frequent Customers</option>
                    <option value="custom">Custom Selection</option>
                  </select>
                </div>
              </div>
              
              {newMessage.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter email subject"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="6"
                  placeholder="Enter your message here..."
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Use {'{customer_name}'}, {'{restaurant_name}'}, {'{time}'} for personalization
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Schedule For (Optional)</label>
                <input
                  type="datetime-local"
                  value={newMessage.scheduledFor}
                  onChange={(e) => setNewMessage({...newMessage, scheduledFor: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {newMessage.scheduledFor ? 'Schedule Message' : 'Send Now'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCompose(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Sections */}
      {activeSection === 'notifications' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Sent</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {notifications.filter(n => n.status === 'sent').length}
                  </p>
                </div>
                <Send className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="card-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Scheduled</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning-600" />
              </div>
            </div>
            <div className="card-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Open Rate</p>
                  <p className="text-2xl font-bold text-neutral-900">68%</p>
                </div>
                <Eye className="h-8 w-8 text-success-600" />
              </div>
            </div>
            <div className="card-premium">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Click Rate</p>
                  <p className="text-2xl font-bold text-neutral-900">24%</p>
                </div>
                <Check className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="card-premium">
            <h3 className="text-lg font-bold mb-6">Recent Notifications</h3>
            <div className="space-y-4">
              {notifications.length > 0 ? notifications.map(notification => (
                <div key={notification.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'email' ? 'bg-blue-100' :
                      notification.type === 'sms' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {notification.type === 'email' ? <Mail className="h-4 w-4 text-blue-600" /> :
                       notification.type === 'sms' ? <Smartphone className="h-4 w-4 text-green-600" /> :
                       <Bell className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{notification.subject || notification.message.substring(0, 50) + '...'}</p>
                      <p className="text-sm text-neutral-600">
                        To: {notification.recipients} • {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    notification.status === 'sent' ? 'bg-success-100 text-success-800' :
                    notification.status === 'scheduled' ? 'bg-warning-100 text-warning-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {notification.status}
                  </span>
                </div>
              )) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Notifications Yet</h3>
                  <p className="text-neutral-600 mb-4">Start engaging with your customers by sending your first message.</p>
                  <button 
                    onClick={() => setShowCompose(true)}
                    className="btn-primary"
                  >
                    Send First Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'customers' && (
        <div className="card-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Customer Database</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="btn-outline flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Last Visit</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Total Bookings</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Preferences</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-800">{customer.name}</p>
                        <p className="text-sm text-neutral-600">{customer.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-neutral-800">
                        {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-neutral-800">{customer.totalBookings || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">
                        {customer.preferences || 'None specified'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-primary-600 hover:text-primary-700 text-sm">
                        Send Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">No customers found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSection === 'templates' && (
        <div className="card-premium">
          <h3 className="text-lg font-bold mb-6">Message Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notificationTemplates.map(template => (
              <div key={template.id} className="border border-neutral-200 rounded-lg p-4">
                <h4 className="font-semibold text-neutral-800 mb-2">{template.name}</h4>
                <p className="text-sm text-neutral-600 mb-3">{template.subject}</p>
                <p className="text-xs text-neutral-500 mb-4">{template.message.substring(0, 100)}...</p>
                <button 
                  onClick={() => {
                    setNewMessage({
                      ...newMessage,
                      subject: template.subject,
                      message: template.message
                    });
                    setShowCompose(true);
                  }}
                  className="btn-outline w-full text-sm"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsTab;

