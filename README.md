# Food Ordering Platform

Full-stack food ordering application with Spring Boot and React.

## Quick Start

### Using Docker
```bash
docker-compose up -d
```

### Manual Setup

1. **Database Setup**
```sql
CREATE DATABASE foodordering;
CREATE USER fooduser WITH PASSWORD 'foodpass123';
GRANT ALL PRIVILEGES ON DATABASE foodordering TO fooduser;
```

2. **Backend**
```bash
cd food-ordering-backend
mvn spring-boot:run
```

3. **Frontend**
```bash
cd food-ordering-frontend
npm install
npm run dev
```

## Demo Credentials
- Email: john@example.com
- Password: password123

## Tech Stack
- Backend: Spring Boot 3.2, Java 17, PostgreSQL
- Frontend: React 18, Vite, Tailwind CSS
- Auth: JWT

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/restaurants
- POST /api/orders

For detailed documentation, see the artifacts in the chat.
