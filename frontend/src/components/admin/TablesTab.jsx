import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Plus, 
  Edit, 
  Trash2, 
  Layout,
  Users,
  Check,
  X
} from 'lucide-react';

const TablesTab = ({ restaurant, onRestaurantUpdate }) => {
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ label: '', seats: 2, x: 0, y: 0 });
  const [showAddTable, setShowAddTable] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [layoutMode, setLayoutMode] = useState(false);

  useEffect(() => {
    fetchTables();
  }, [restaurant]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurant.id}/tables`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
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
        fetchTables();
        setNewTable({ label: '', seats: 2, x: 0, y: 0 });
        setShowAddTable(false);
        alert('Table added successfully!');
      }
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const updateTable = async (tableId, updates) => {
    try {
      const response = await fetch(`/api/restaurants/tables/${tableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchTables();
        setEditingTable(null);
        alert('Table updated successfully!');
      }
    } catch (error) {
      console.error('Error updating table:', error);
    }
  };

  const deleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await fetch(`/api/restaurants/tables/${tableId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        fetchTables();
        alert('Table deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-neutral-800">
          Table Management
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLayoutMode(!layoutMode)}
            className={`btn-outline flex items-center space-x-2 ${layoutMode ? 'bg-primary-50 border-primary-300' : ''}`}
          >
            <Layout className="h-4 w-4" />
            <span>{layoutMode ? 'Exit Layout' : 'Layout Mode'}</span>
          </button>
          <button
            onClick={() => setShowAddTable(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Tables</p>
              <p className="text-2xl font-bold text-neutral-900">{tables.length}</p>
            </div>
            <Grid3X3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Seats</p>
              <p className="text-2xl font-bold text-neutral-900">
                {tables.reduce((sum, table) => sum + table.seats, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Available Now</p>
              <p className="text-2xl font-bold text-neutral-900">
                {tables.filter(table => !table.occupied).length}
              </p>
            </div>
            <Check className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <div className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Occupied</p>
              <p className="text-2xl font-bold text-neutral-900">
                {tables.filter(table => table.occupied).length}
              </p>
            </div>
            <X className="h-8 w-8 text-error-600" />
          </div>
        </div>
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

      {/* Tables Layout */}
      {layoutMode ? (
        <div className="card-premium">
          <h3 className="text-lg font-bold mb-4">Restaurant Layout</h3>
          <div className="relative bg-neutral-100 rounded-lg p-8 min-h-96 border-2 border-dashed border-neutral-300">
            {tables.map(table => (
              <div
                key={table.id}
                className="absolute bg-white border-2 border-primary-300 rounded-lg p-4 cursor-move shadow-lg"
                style={{ 
                  left: `${table.x || 0}px`, 
                  top: `${table.y || 0}px`,
                  width: '120px',
                  height: '80px'
                }}
              >
                <div className="text-center">
                  <p className="font-semibold text-sm">{table.label}</p>
                  <p className="text-xs text-neutral-600">{table.seats} seats</p>
                  <div className={`w-3 h-3 rounded-full mx-auto mt-1 ${
                    table.occupied ? 'bg-error-500' : 'bg-success-500'
                  }`} />
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="text-center text-neutral-500 py-16">
                Add tables to see them in the layout
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tables Grid */
        <div className="card-premium">
          <h3 className="text-lg font-bold mb-6">All Tables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map(table => (
              <div key={table.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-neutral-800">{table.label}</h4>
                    <p className="text-sm text-neutral-600">{table.seats} seats</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    table.occupied ? 'bg-error-500' : 'bg-success-500'
                  }`} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    table.occupied 
                      ? 'bg-error-100 text-error-800' 
                      : 'bg-success-100 text-success-800'
                  }`}>
                    {table.occupied ? 'Occupied' : 'Available'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setEditingTable(table)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteTable(table.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {tables.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Grid3X3 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Tables Yet</h3>
                <p className="text-neutral-600 mb-4">Add your first table to start managing your restaurant layout.</p>
                <button 
                  onClick={() => setShowAddTable(true)}
                  className="btn-primary"
                >
                  Add First Table
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Edit Table</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              updateTable(editingTable.id, {
                label: editingTable.label,
                seats: editingTable.seats
              });
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Label</label>
                <input
                  type="text"
                  value={editingTable.label}
                  onChange={(e) => setEditingTable({...editingTable, label: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Seats</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingTable.seats}
                  onChange={(e) => setEditingTable({...editingTable, seats: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Update Table</button>
                <button 
                  type="button" 
                  onClick={() => setEditingTable(null)}
                  className="btn-outline flex-1"
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

export default TablesTab;
