import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Package, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminOrderAPI } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import StatusUpdateModal from '../components/StatusUpdateModal';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [updateModal, setUpdateModal] = useState({ open: false, order: null });

  const filters = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PLACED', label: 'Placed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      const response = activeFilter === 'ALL'
        ? await adminOrderAPI.getAll()
        : await adminOrderAPI.getAll(activeFilter);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus, notes) => {
    try {
      await adminOrderAPI.updateStatus(orderId, { status: newStatus, notes });
      toast.success('Order status updated successfully');
      setUpdateModal({ open: false, order: null });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600">
            {activeFilter === 'ALL' ? 'No orders have been placed yet.' : `No orders with status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                        #{order.id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.restaurantName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setUpdateModal({ open: true, order })}
                        className="text-primary-600 hover:text-primary-700 font-medium mr-3"
                      >
                        Update
                      </button>
                      <Link to={`/admin/orders/${order.id}`} className="text-gray-600 hover:text-gray-700">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/admin/orders/${order.id}`} className="text-primary-600 font-semibold">
                    #{order.id.substring(0, 8)}
                  </Link>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-gray-900 font-medium">{order.restaurantName}</p>
                <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-gray-900">₹{order.totalAmount.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setUpdateModal({ open: true, order })}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    Update Status
                  </button>
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <StatusUpdateModal
        isOpen={updateModal.open}
        onClose={() => setUpdateModal({ open: false, order: null })}
        order={updateModal.order}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}

export default AdminOrders;
