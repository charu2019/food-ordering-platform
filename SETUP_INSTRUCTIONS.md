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


