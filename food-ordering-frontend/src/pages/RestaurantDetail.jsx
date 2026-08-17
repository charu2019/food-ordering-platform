import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Plus, ArrowLeft, Star, Truck, ShieldCheck, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '../api/api';
import useCartStore from '../store/cartStore';
import { getRestaurantImage, getMenuItemImage } from '../utils/images';

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id),
        restaurantAPI.getMenu(id),
      ]);
      setRestaurant(restaurantRes.data);
      setMenuItems(menuRes.data);
    } catch (error) {
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    const success = addItem(menuItem, restaurant);
    if (success) {
      toast.success(`${menuItem.name} added to cart`);
    }
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Restaurant not found</p>
          <button
            onClick={() => navigate('/')}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Go back to restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src={getRestaurantImage(restaurant.id || restaurant.name)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop`;
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition z-10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {restaurant.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              {restaurant.rating && (
                <span className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {restaurant.rating}
                </span>
              )}
              <span className="text-white/90 text-sm font-medium">
                {restaurant.deliveryTime || '25-30'} mins
              </span>
              <span className="text-white/60">•</span>
              <span className="text-white/90 text-sm">
                ₹{restaurant.priceForTwo || '300'} for two
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-md">{restaurant.address}</span>
            </div>

            {restaurant.openingTime && restaurant.closingTime && (
              <div className="flex items-center gap-2 text-white/80 text-sm mt-2">
                <Clock className="h-4 w-4" />
                <span>
                  {restaurant.openingTime} - {restaurant.closingTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="h-4 w-4 text-orange-500" />
            <span>Free delivery on orders above ₹499</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Hygienic & safe food</span>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {menuItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No menu items available</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedMenu).map(([category, items]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-400 font-medium">
                    {items.length} items
                  </span>
                </div>

                {/* Menu Items */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="flex">
                        {/* Food Image */}
                        <div className="relative w-32 sm:w-40 h-32 sm:h-36 flex-shrink-0">
                          <img
                            src={getMenuItemImage(item.name)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`;
                            }}
                          />
                          {/* Add Button Overlay on Image */}
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!item.isAvailable}
                              className="w-full bg-white hover:bg-orange-50 text-orange-500 font-bold py-2 rounded-lg shadow-lg transition-all duration-200 border-2 border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                            >
                              ADD
                            </button>
                          </div>
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            {/* Veg/Non-Veg Badge & Bestseller */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                                item.isVegetarian 
                                  ? 'border-green-500' 
                                  : 'border-red-500'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  item.isVegetarian 
                                    ? 'bg-green-500' 
                                    : 'bg-red-500'
                                }`}></div>
                              </div>
                              <span className={`text-xs font-medium ${
                                item.isVegetarian ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                              </span>
                              {index < 2 && (
                                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                  BESTSELLER
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>

                            {item.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{item.price}
                            </p>
                            {!item.isAvailable && (
                              <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded">
                                Currently Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantDetail;
