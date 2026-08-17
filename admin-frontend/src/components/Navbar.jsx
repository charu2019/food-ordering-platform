import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Shield, LayoutDashboard, Package } from 'lucide-react';
import useAuthStore from '../store/authStore';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-primary-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/admin" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-300" />
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/admin"
              className="flex items-center space-x-1 text-primary-200 hover:text-white transition"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center space-x-1 text-primary-200 hover:text-white transition"
            >
              <Package className="h-5 w-5" />
              <span>Orders</span>
            </Link>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-primary-200">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-primary-200 hover:text-white transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
