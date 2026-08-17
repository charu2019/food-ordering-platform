import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PLACED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'PREPARING':
        return <Package className="h-5 w-5 text-orange-600" />;
      case 'PICKED_UP':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'PLACED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800';
      case 'PICKED_UP':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
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
        <div className="text-center">Loading your orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <Package className="h-24 w-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start exploring restaurants and place your first order!
          </p>
          <Link
            to="/"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {order.restaurantName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {formatStatus(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-full"
                  >
                    {item.quantity}x {item.menuItemName}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-gray-500 px-3 py-1">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Expected by {formatDate(order.estimatedDeliveryTime)}
              </div>
            )}

            <div className="mt-4 text-primary-600 font-semibold text-sm">
              View Details →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Orders;