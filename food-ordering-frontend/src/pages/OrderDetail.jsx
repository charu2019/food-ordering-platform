import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Phone, Package, CheckCircle, Truck, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/api';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await orderAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const allSteps = [
      { status: 'PLACED', label: 'Order Placed', icon: CheckCircle },
      { status: 'PREPARING', label: 'Preparing', icon: Package },
      { status: 'PICKED_UP', label: 'Picked Up', icon: Truck },
      { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
    ];

    const statusOrder = ['PLACED', 'PREPARING', 'PICKED_UP', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order?.status);

    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const steps = getStatusSteps();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="text-primary-600 hover:text-primary-700 mb-6"
      >
        ← Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order #{order.id.substring(0, 8)}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-primary-600">
              ₹{order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Status
            </h2>
            <div className="relative">
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                          step.completed
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <p
                        className={`text-sm text-center ${
                          step.completed ? 'text-gray-900 font-semibold' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-6 h-1 ${
                            step.completed ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                          style={{
                            left: `${(index * 100) / (steps.length - 1) + 8.33}%`,
                            width: `${100 / (steps.length - 1) - 16.66}%`,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">This order has been cancelled</p>
          </div>
        )}

        {order.status === 'PENDING_PAYMENT' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-800 font-semibold">Payment pending for this order</p>
                <p className="text-yellow-700 text-sm mt-1">Complete payment to confirm your order</p>
              </div>
              <button
                onClick={() => navigate(`/payment/${order.id}`)}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </button>
            </div>
          </div>
        )}

        {/* Restaurant Info */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Restaurant
          </h2>
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {order.restaurantName}
          </p>
        </div>

        {/* Delivery Address */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Delivery Address
          </h2>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-1 flex-shrink-0" />
            <p className="text-gray-700">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Estimated Delivery Time */}
        {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                Expected by: <strong>{formatDate(order.estimatedDeliveryTime)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {item.menuItemName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  ₹{item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ₹{order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2">
              <span className="font-semibold text-gray-700">Delivery Fee</span>
              <span className="font-semibold text-gray-900">₹40.00</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span className="text-primary-600">
                ₹{(order.totalAmount + 40).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Need Help?
        </h3>
        <p className="text-blue-800">
          Contact customer support for any issues with your order.
        </p>
      </div>
    </div>
  );
}

export default OrderDetail;