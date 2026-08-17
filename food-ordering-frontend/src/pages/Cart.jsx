import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Clock,
  Tag,
  Truck,
  Shield,
  CreditCard,
  X,
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { getMenuItemImage, getRestaurantImage } from '../utils/images';

function Cart() {
  const navigate = useNavigate();
  const {
    items,
    restaurant,
    updateQuantity,
    removeItem,
    getTotal,
    clearCart,
  } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'FOODIE10') {
      setAppliedCoupon({ code: 'FOODIE10', discount: 10 });
    } else {
      setAppliedCoupon(null);
    }
  };

  const subtotal = getTotal();
  const deliveryFee = 40;
  const discount = appliedCoupon ? (subtotal * 10) / 100 : 0;
  const total = subtotal + deliveryFee - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto bg-gradient-to-br from-orange-100 to-amber-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-24 w-24 text-orange-300" strokeWidth={1} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Looks like you haven't added anything yet. Discover delicious meals from top restaurants!
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 text-lg"
          >
            Explore Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 text-sm font-semibold flex items-center gap-1 hover:bg-red-50 px-3 py-2 rounded-lg transition"
        >
          <Trash2 className="h-4 w-4" />
          Clear Cart
        </button>
      </div>

      {restaurant && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-8 flex items-center gap-4 shadow-sm">
          <img
            src={getRestaurantImage(restaurant.name)}
            alt={restaurant.name}
            className="w-20 h-20 rounded-xl object-cover shadow-md"
          />
          <div className="flex-1">
            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">
              Ordering from
            </p>
            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {restaurant.area || 'Nearby'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 25-35 min
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
              <Shield className="h-4 w-4" />
              <span>Safe delivery</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              <img
                src={getMenuItemImage(item.name)}
                alt={item.name}
                className="w-24 h-24 rounded-xl object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">{item.name}</h3>
                <p className="text-orange-600 font-semibold mt-1">₹{item.price} each</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Veg
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-3 hover:bg-gray-200 transition text-gray-600"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 font-bold text-lg min-w-[3rem] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-3 hover:bg-gray-200 transition text-gray-600"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="w-24 text-right">
                  <p className="font-bold text-gray-900 text-lg">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Coupon Code */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-orange-500" />
              <h3 className="font-bold text-gray-900">Have a coupon code?</h3>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
              >
                Apply
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-3 flex items-center gap-2 text-green-600 text-sm font-medium">
                <Tag className="h-4 w-4" />
                <span>Coupon "{appliedCoupon.code}" applied! 10% off</span>
                <button onClick={() => setAppliedCoupon(null)} className="ml-auto">
                  <X className="h-4 w-4 hover:text-red-500" />
                </button>
              </div>
            )}
            {!appliedCoupon && coupon && (
              <p className="mt-2 text-xs text-gray-400">Try: FOODIE10</p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={getMenuItemImage(item.name)}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
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
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Discount (10%)
                  </span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-orange-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 text-lg"
            >
              Proceed to Checkout
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Secure checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Fast delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;