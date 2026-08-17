import { create } from 'zustand';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getStoredToken = () => {
  const token = localStorage.getItem('admin_token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return null;
  }
  return token;
};

const getStoredUser = () => {
  const token = getStoredToken();
  if (!token) return null;
  return JSON.parse(localStorage.getItem('admin_user')) || null;
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),

  login: (userData, token) => {
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('admin_token', token);
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    localStorage.setItem('admin_user', JSON.stringify(userData));
    set({ user: userData });
  },
}));

export default useAuthStore;
