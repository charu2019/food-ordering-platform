import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  Clock,
  Home,
  Briefcase,
  Navigation,
  CreditCard,
  Shield,
  ChevronRight,
  Truck,
  Store,
} from 'lucide-react';
import { orderAPI } from '../api/api';
import useCartStore from '../store/cartStore';
import { getMenuItemImage, getRestaurantImage, RESTAURANT_IMAGES } from '../utils/images';

function Checkout() {
  const navigate = useNavigate();
  const { items, restaurant, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [selectedAddressType, setSelectedAddressType] = useState('home');
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    specialInstructions: '',
  });

  const addressPresets = [
    { type: 'home', label: 'Home', icon: Home, address: '123 MG Road, Koramangala, Bangalore' },
    { type: 'work', label: 'Work', icon: Briefcase, address: '456 Tech Park, Whitefield, Bangalore' },
    { type: 'other', label: 'Other', icon: Navigation, address: '' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (preset) => {
    setSelectedAddressType(preset.type);
    if (preset.type !== 'other') {
      setFormData({ ...formData, deliveryAddress: preset.address });
    } else {
      setFormData({ ...formData, deliveryAddress: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        restaurantId: restaurant.id,
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        deliveryAddress: formData.deliveryAddress,
        specialInstructions: formData.specialInstructions || null,
      };

      const response = await orderAPI.create(orderData);

      toast.success('Order created! Proceeding to payment...');
      navigate(`/payment/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getTotal();
  const deliveryFee = 40;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={RESTAURANT_IMAGES.default}
          alt="Food delivery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Store className="h-4 w-4" />
            <span>{restaurant?.name || 'Restaurant'}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {addressPresets.map((preset) => (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleAddressSelect(preset)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedAddressType === preset.type
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <preset.icon className="h-6 w-6" />
                    <span className="font-semibold text-sm">{preset.label}</span>
                    {preset.type !== 'other' && (
                      <span className="text-xs text-center line-clamp-2 opacity-70">
                        {preset.address.substring(0, 30)}...
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Delivery Address *
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="Enter your complete delivery address with landmarks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="Ring the bell, leave at door, etc."
                  />
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Clock className="h-7 w-7 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Estimated Delivery Time</h3>
                  <p className="text-orange-600 font-semibold text-xl">25-35 minutes</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 font-medium">Delivery Area Map</p>
                  <p className="text-gray-300 text-sm">Showing delivery zone</p>
                </div>
              </div>
            </div>

            {/* Submit Button (Mobile) */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="lg:hidden w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 text-lg disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : `Place Order • ₹${total.toFixed(2)}`}
            </button>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={getRestaurantImage(restaurant?.name)}
                  alt={restaurant?.name}
                  className="w-14 h-14 rounded-xl object-cover shadow-sm"
                />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{restaurant?.name}</h2>
                  <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={getMenuItemImage(item.name)}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-3">Accepted Payment Methods</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-700">Visa</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-semibold text-gray-700">Mastercard</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-xs font-bold text-purple-600">UPI</span>
                  </div>
                </div>
              </div>

              {/* Submit Button (Desktop) */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="hidden lg:block mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 text-lg disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure & encrypted payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;