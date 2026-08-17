import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const VALID_TRANSITIONS = {
  PENDING_PAYMENT: ['PLACED', 'CANCELLED'],
  PLACED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_LABELS = {
  PLACED: 'Placed',
  PREPARING: 'Preparing',
  PICKED_UP: 'Picked Up',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function StatusUpdateModal({ isOpen, onClose, order, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      const validNext = VALID_TRANSITIONS[order.status] || [];
      if (validNext.length === 1) {
        setSelectedStatus(validNext[0]);
      } else {
        setSelectedStatus('');
      }
      setNotes('');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const validNextStatuses = VALID_TRANSITIONS[order.status] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setSubmitting(true);
    try {
      await onUpdate(order.id, selectedStatus, notes || null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {STATUS_LABELS[order.status] || order.status}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
              {validNextStatuses.length === 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">This order is in a terminal state.</span>
                </div>
              ) : (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select new status</option>
                  {validNextStatuses.map((status) => (
                    <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any notes about this status update..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedStatus || submitting || validNextStatuses.length === 0}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StatusUpdateModal;
