import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Star, Search, Bike, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '../api/api';
import { HERO_BANNER, getRestaurantImage } from '../utils/images';

const CATEGORIES = [
  { name: 'All', emoji: '🍽️' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Burgers', emoji: '🍔' },
  { name: 'Indian', emoji: '🍛' },
  { name: 'Chinese', emoji: '🥡' },
];

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const getRating = (id) => {
    const ratings = [4.2, 4.5, 4.8, 4.3, 4.7, 4.1, 4.6, 4.4];
    return ratings[id % ratings.length];
  };

  const getDeliveryTime = (id) => {
    const times = ['20-30', '25-35', '15-25', '30-40', '20-25'];
    return times[id % times.length];
  };

  const getFreeDelivery = (id) => {
    return id % 3 === 0;
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      restaurant.name?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Finding delicious food near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative w-full h-[420px] md:h-[480px] overflow-hidden">
        <img
          src={HERO_BANNER}
          alt="Delicious food spread"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3 max-w-xl">
            Craving something <span className="text-orange-400">delicious</span>?
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-md">
            Order from your favourite restaurants. Fast delivery, hot food, happy you.
          </p>
          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-xl shadow-lg max-w-xl overflow-hidden p-1">
            <div className="flex items-center justify-center px-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-3 px-2 text-gray-800 outline-none text-base bg-transparent"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Category Filter Chips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 shadow-sm
                ${
                  selectedCategory === cat.name
                    ? 'bg-orange-500 text-white shadow-orange-200 shadow-md'
                    : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All Restaurants' : selectedCategory}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => {
            const rating = getRating(restaurant.id);
            const deliveryTime = getDeliveryTime(restaurant.id);
            const freeDelivery = getFreeDelivery(restaurant.id);

            return (
              <Link
                key={restaurant.id}
                to={`/restaurant/${restaurant.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Restaurant Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={getRestaurantImage(restaurant.name)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Delivery Time Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-md">
                    <Bike className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-bold text-gray-800">{deliveryTime} min</span>
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-md">
                    <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                    <span className="text-xs font-bold text-gray-800">{rating}</span>
                  </div>
                  {/* Free Delivery Tag */}
                  {freeDelivery && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wide">
                      Free Delivery
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-orange-500 transition-colors" />
                  </div>

                  <p className="text-gray-500 text-sm mb-3 line-clamp-1">
                    {restaurant.description || 'Delicious food awaits!'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {restaurant.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                    )}
                    {restaurant.openingTime && restaurant.closingTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredRestaurants.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-1">No restaurants found</h3>
            <p className="text-gray-500">Try a different search or category</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
