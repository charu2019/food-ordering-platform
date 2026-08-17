import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Smartphone, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../api/api';
import useCartStore from '../store/cartStore';
import { PAYMENT_SUCCESS_IMAGE, getMenuItemImage, RESTAURANT_IMAGES } from '../utils/images';

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Credit Card', icon: CreditCard },
  { id: 'debit', label: 'Debit Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: Smartphone },
];

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeMethod, setActiveMethod] = useState('credit');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = formatCardNumber(value);
      if (value.replace(/\s/g, '').length > 16) return;
    }
    if (name === 'expiryDate') {
      value = formatExpiryDate(value);
      if (value.length > 5) return;
    }
    if (name === 'cvv') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 4) return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleMethodChange = (method) => {
    if (method !== 'credit') {
      toast('Coming soon! Only credit card is available for now.', { icon: '🚧' });
      return;
    }
    setActiveMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    if (!formData.cardHolderName.trim()) {
      toast.error('Please enter card holder name');
      return;
    }
    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (!formData.cvv.match(/^\d{3,4}$/)) {
      toast.error('Please enter a valid CVV');
      return;
    }
    setProcessing(true);
    try {
      const paymentData = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardHolderName: formData.cardHolderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      };
      await paymentAPI.process(orderId, paymentData);
      setSuccess(true);
      clearCart();
      toast.success('Payment successful! Order placed.');
      setTimeout(() => navigate(`/orders/${orderId}`), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Order not found</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-center">
          <div className="relative">
            <img
              src={PAYMENT_SUCCESS_IMAGE}
              alt="Payment Success"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="p-8">
            <div className="relative -mt-16 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm animate-bounce">
                🎉
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-4">Your delicious food is on its way</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-6">
              <span className="text-sm font-mono font-bold text-green-700">#{orderId.substring(0, 8)}</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>30-45 min delivery</span>
              </div>
            </div>

            <div className="animate-pulse text-emerald-600 font-medium">Redirecting to order tracking...</div>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={() => navigate(`/orders/${orderId}`)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              Track Your Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with food theme */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-white/80 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/30">
              <img
                src={RESTAURANT_IMAGES.pizza}
                alt="Restaurant"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Secure Checkout</h1>
              <p className="text-white/80 text-sm">Order #{orderId.substring(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            {/* Payment Method Tabs */}
            <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
              <div className="flex border-b border-gray-100">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodChange(method.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all ${
                        activeMethod === method.id
                          ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {method.label}
                      {method.id !== 'credit' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
              {/* Visual Card Preview */}
              <div className="relative mb-8">
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-xl shadow-purple-200/50 max-w-sm mx-auto aspect-[1.6/1] flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-yellow-300/80 rounded-md" />
                    <div className="flex gap-1">
                      <div className="w-6 h-6 bg-red-400/80 rounded-full" />
                      <div className="w-6 h-6 bg-orange-400/80 rounded-full -ml-2" />
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-lg tracking-widest mb-4">
                      {formData.cardNumber || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-white/60 uppercase">Card Holder</p>
                        <p className="text-sm font-medium uppercase tracking-wide">
                          {formData.cardHolderName || 'YOUR NAME'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-white/60 uppercase">Expires</p>
                        <p className="text-sm font-medium">{formData.expiryDate || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-6">Card Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-lg tracking-wider transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={formData.cardHolderName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                      placeholder="•••"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay ₹{(order.totalAmount + 40).toFixed(2)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5" />
                  <span>256-bit SSL</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>PCI Compliant</span>
                </div>
                <div className="w-px h-3 bg-gray-300" />
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </form>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
              <div className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-3 py-1">VISA</div>
              <div className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-3 py-1">Mastercard</div>
              <div className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-3 py-1">Rupay</div>
              <div className="text-xs font-semibold text-gray-500 border border-gray-300 rounded px-3 py-1">UPI</div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Order</h2>

              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Order ID</p>
                <p className="font-mono font-bold text-gray-900">#{orderId.substring(0, 8)}</p>
              </div>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <img
                      src={getMenuItemImage(item.menuItemName)}
                      alt={item.menuItemName}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.menuItemName}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                      ₹{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-semibold text-gray-900">₹40.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-orange-600">₹{(order.totalAmount + 40).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800 font-medium">
                  Demo mode — no real charges will be made. Use any card number.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
