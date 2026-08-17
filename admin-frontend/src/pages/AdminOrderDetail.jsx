import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Package, CheckCircle, Truck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminOrderAPI } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import StatusUpdateModal from '../components/StatusUpdateModal';

function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const response = await adminOrderAPI.getById(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, notes) => {
    try {
      await adminOrderAPI.updateStatus(orderId, { status: newStatus, notes });
      toast.success('Order status updated successfully');
      setUpdateModal(false);
      fetchOrderDetail();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
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
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.substring(0, 8)}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            <p className="text-sm text-gray-500 mt-1">Customer: {order.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-primary-600">₹{order.totalAmount.toFixed(2)}</p>
            <button
              onClick={() => setUpdateModal(true)}
              className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm"
            >
              Update Status
            </button>
          </div>
        </div>

        {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="relative">
              <div className="flex justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className={`text-sm text-center ${step.completed ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
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
            <p className="text-yellow-800 font-semibold">Payment pending for this order</p>
          </div>
        )}

        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Restaurant</h2>
          <p className="text-xl font-semibold text-gray-900">{order.restaurantName}</p>
        </div>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h2>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-1 flex-shrink-0" />
            <p className="text-gray-700">{order.deliveryAddress}</p>
          </div>
        </div>

        {order.estimatedDeliveryTime && order.status !== 'DELIVERED' && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2" />
              <span>Expected by: <strong>{formatDate(order.estimatedDeliveryTime)}</strong></span>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.menuItemName}</p>
                  <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg mt-2">
              <span className="font-semibold text-gray-700">Delivery Fee</span>
              <span className="font-semibold text-gray-900">₹40.00</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span className="text-primary-600">₹{(order.totalAmount + 40).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <StatusUpdateModal
        isOpen={updateModal}
        onClose={() => setUpdateModal(false)}
        order={order}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}

export default AdminOrderDetail;
