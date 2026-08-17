// Food images from Unsplash (free, no API key needed)
// Using specific photo IDs for consistent, high-quality food images

export const RESTAURANT_IMAGES = {
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop',
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
};

export const MENU_ITEM_IMAGES = {
  // Pizza
  'margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
  'pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
  'veggie': 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=300&h=200&fit=crop',
  // Burger
  'classic burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop',
  'veggie burger': 'https://images.unsplash.com/photo-1520072959219-c595b0736521?w=300&h=200&fit=crop',
  'cheese burger': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&h=200&fit=crop',
  // Indian
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop',
  'paneer tikka': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
  'dal makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
  // Sides
  'garlic bread': 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=300&h=200&fit=crop',
  'french fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop',
  'naan': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
  // Default
  'default': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
};

export const HERO_BANNER = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=500&fit=crop';

export const EMPTY_CART_IMAGE = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop';

export const PAYMENT_SUCCESS_IMAGE = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop';

export const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=900&fit=crop';

// Map restaurant names to images
export const getRestaurantImage = (name) => {
  const lower = name?.toLowerCase() || '';
  if (lower.includes('pizza')) return RESTAURANT_IMAGES.pizza;
  if (lower.includes('burger')) return RESTAURANT_IMAGES.burger;
  if (lower.includes('spice') || lower.includes('indian') || lower.includes('garden')) return RESTAURANT_IMAGES.indian;
  if (lower.includes('chinese') || lower.includes('wok')) return RESTAURANT_IMAGES.chinese;
  return RESTAURANT_IMAGES.default;
};

// Map menu item names to images
export const getMenuItemImage = (name) => {
  const lower = name?.toLowerCase() || '';
  if (lower.includes('margherita')) return MENU_ITEM_IMAGES['margherita'];
  if (lower.includes('pepperoni')) return MENU_ITEM_IMAGES['pepperoni'];
  if (lower.includes('veggie supreme') || lower.includes('veggie pizza')) return MENU_ITEM_IMAGES['veggie'];
  if (lower.includes('classic burger')) return MENU_ITEM_IMAGES['classic burger'];
  if (lower.includes('veggie burger')) return MENU_ITEM_IMAGES['veggie burger'];
  if (lower.includes('cheese burger')) return MENU_ITEM_IMAGES['cheese burger'];
  if (lower.includes('butter chicken')) return MENU_ITEM_IMAGES['butter chicken'];
  if (lower.includes('paneer')) return MENU_ITEM_IMAGES['paneer tikka'];
  if (lower.includes('dal')) return MENU_ITEM_IMAGES['dal makhani'];
  if (lower.includes('garlic bread')) return MENU_ITEM_IMAGES['garlic bread'];
  if (lower.includes('french fries') || lower.includes('fries')) return MENU_ITEM_IMAGES['french fries'];
  if (lower.includes('naan')) return MENU_ITEM_IMAGES['naan'];
  return MENU_ITEM_IMAGES['default'];
};
