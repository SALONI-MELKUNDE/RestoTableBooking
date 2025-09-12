import React, { useState } from 'react';
import { Star, Clock, Users, ChefHat, Filter, Search } from 'lucide-react';

const MenuDisplay = ({ restaurant, menus, isLoading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-neutral-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!menus || menus.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
        <h3 className="text-xl font-display font-bold text-neutral-800 mb-4">
          Menu Coming Soon
        </h3>
        <p className="text-neutral-600">
          This restaurant is still preparing their menu. Check back soon!
        </p>
      </div>
    );
  }

  // Get all unique categories from all menu items
  const allCategories = ['all'];
  menus.forEach(menu => {
    if (menu.items) {
      menu.items.forEach(item => {
        if (item.category && !allCategories.includes(item.category)) {
          allCategories.push(item.category);
        }
      });
    }
  });

  // Filter items based on category and search term
  const getFilteredItems = () => {
    let allItems = [];
    menus.forEach(menu => {
      if (menu.items) {
        menu.items.forEach(item => {
          allItems.push({ ...item, menuName: menu.name });
        });
      }
    });

    return allItems.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && item.available;
    });
  };

  const filteredItems = getFilteredItems();

  const formatCategory = (category) => {
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryColor = (category) => {
    const colors = {
      'APPETIZER': 'bg-blue-100 text-blue-800',
      'MAIN_COURSE': 'bg-green-100 text-green-800',
      'DESSERT': 'bg-pink-100 text-pink-800',
      'BEVERAGE': 'bg-purple-100 text-purple-800',
      'SIDE': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-neutral-800 mb-4">
          Our Menu
        </h2>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Discover our carefully crafted dishes made with the finest ingredients and passion for culinary excellence.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-neutral-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {allCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Item Image */}
              {item.imageUrl && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-48 bg-neutral-100 items-center justify-center">
                    <ChefHat className="h-12 w-12 text-neutral-400" />
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Item Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-display font-bold text-neutral-800 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                        {formatCategory(item.category)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        from {item.menuName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-primary-600">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Ingredients */}
                {item.ingredients && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-500 mb-1">
                      <span className="font-medium">Ingredients:</span>
                    </p>
                    <p className="text-xs text-neutral-600">
                      {item.ingredients}
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {item.allergens && (
                  <div className="mb-4">
                    <p className="text-xs text-red-600">
                      <span className="font-medium">⚠️ Contains:</span> {item.allergens}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button className="w-full btn-primary text-sm py-2">
                  Add to Order
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h3 className="text-xl font-display font-bold text-neutral-800 mb-4">
            No Items Found
          </h3>
          <p className="text-neutral-600">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )}

      {/* Menu Sections */}
      <div className="space-y-8 mt-12">
        {menus.map(menu => (
          <div key={menu.id} className="border-t border-neutral-200 pt-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-display font-bold text-neutral-800 mb-2">
                {menu.name}
              </h3>
              {menu.description && (
                <p className="text-neutral-600 max-w-xl mx-auto">
                  {menu.description}
                </p>
              )}
            </div>

            {menu.items && menu.items.length > 0 ? (
              <div className="space-y-4">
                {menu.items
                  .filter(item => item.available)
                  .map(item => (
                    <div key={item.id} className="flex items-start justify-between p-4 bg-white rounded-lg border border-neutral-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-neutral-800">
                            {item.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>
                            {formatCategory(item.category)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-neutral-600 text-sm mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.ingredients && (
                          <p className="text-xs text-neutral-500 mb-1">
                            <span className="font-medium">Ingredients:</span> {item.ingredients}
                          </p>
                        )}
                        {item.allergens && (
                          <p className="text-xs text-red-600">
                            <span className="font-medium">⚠️ Contains:</span> {item.allergens}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-xl font-bold text-primary-600 mb-2">
                          ${parseFloat(item.price).toFixed(2)}
                        </p>
                        <button className="btn-outline text-sm px-4 py-1">
                          Add to Order
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500 py-8">
                No items available in this menu.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuDisplay;

