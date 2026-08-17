import { Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';

const statusConfig = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    colors: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  PLACED: {
    label: 'Placed',
    colors: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  PREPARING: {
    label: 'Preparing',
    colors: 'bg-orange-100 text-orange-800',
    icon: Package,
  },
  PICKED_UP: {
    label: 'Picked Up',
    colors: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    colors: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    colors: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.PENDING_PAYMENT;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.colors} ${sizeClasses[size]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export default StatusBadge;
