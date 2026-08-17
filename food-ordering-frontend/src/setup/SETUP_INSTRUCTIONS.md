# Setup Instructions

## What to Do Next

1. **Copy the Java source files** from the chat artifacts into:
   - `food-ordering-backend/src/main/java/com/foodordering/`

2. **Copy the database migration** (V1__Initial_Schema.sql) into:
   - `food-ordering-backend/src/main/resources/db/migration/`

3. **Copy the React source files** from the chat artifacts into:
   - `food-ordering-frontend/src/`

4. **Install and run:**
```bash
# Backend
cd food-ordering-backend
mvn clean install
mvn spring-boot:run

# Frontend (in new terminal)
cd food-ordering-frontend
npm install
npm run dev
```

## Files from Chat to Copy

### Backend Java Files (copy to src/main/java/com/foodordering/):
- model/enums/UserRole.java
- model/enums/OrderStatus.java
- model/enums/PaymentStatus.java
- model/entity/*.java (User, Restaurant, MenuItem, Order, OrderItem, Payment)
- repository/*.java (All repository interfaces)
- service/*.java (AuthService, RestaurantService, OrderService, PaymentService)
- controller/*.java (AuthController, RestaurantController, OrderController)
- security/*.java (JwtUtil, CustomUserDetailsService, JwtAuthenticationFilter)
- config/*.java (SecurityConfig, DataSeeder)
- exception/*.java (Custom exceptions and GlobalExceptionHandler)
- dto/*/*.java (All DTO classes)
- FoodOrderingApplication.java (main class)

### Frontend Files (copy to src/):
- api/api.js
- store/authStore.js
- store/cartStore.js
- components/Navbar.jsx
- pages/Login.jsx
- pages/Home.jsx
- pages/RestaurantDetail.jsx
- pages/Cart.jsx
- pages/Checkout.jsx
- App.jsx
- main.jsx
- index.css

### Database Migration (copy to src/main/resources/db/migration/):
- V1__Initial_Schema.sql
