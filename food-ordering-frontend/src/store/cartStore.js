import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  restaurant: null,
  
  addItem: (menuItem, restaurant) => {
    const { items, restaurant: currentRestaurant } = get();
    
    // Check if adding from different restaurant
    if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
      if (!confirm('This will clear your cart. Continue?')) {
        return false;
      }
      set({ items: [], restaurant: null });
    }
    
    // Check if item already in cart
    const existingItem = items.find(item => item.id === menuItem.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({
        items: [...items, { ...menuItem, quantity: 1 }],
        restaurant: restaurant,
      });
    }
    return true;
  },
  
  removeItem: (itemId) => {
    const items = get().items.filter(item => item.id !== itemId);
    set({
      items,
      restaurant: items.length === 0 ? null : get().restaurant,
    });
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    
    set({
      items: get().items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => set({ items: [], restaurant: null }),
  
  getTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },
  
  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));

export default useCartStore;