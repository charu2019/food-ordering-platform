# AGENTS.md - LLM Agent Reference

> This file provides context for AI coding assistants working on this codebase.
> Last updated: August 17, 2026

---

## Project Overview

**Food Ordering Platform** - A microservices-based food ordering system with:
- Customer-facing app (browse restaurants, place orders, make payments)
- Admin app (manage orders, update status, view stats)
- Apache Kafka for async order status events
- Shared PostgreSQL database

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ┌─────────────────────┐          ┌─────────────────────┐             │
│   │   ADMIN FRONTEND    │          │  CUSTOMER FRONTEND   │             │
│   │   (React + Vite)    │          │  (React + Vite)      │             │
│   │   Port: 3001        │          │  Port: 3000          │             │
│   │   /admin/login      │          │  /login              │             │
│   │   /admin/dashboard  │          │  /                   │             │
│   └──────────┬──────────┘          └──────────┬──────────┘             │
│              │ REST API                        │ REST API                │
│              │ (ADMIN JWT)                     │ (CUSTOMER JWT)         │
│   ┌──────────▼──────────┐          ┌──────────▼──────────┐             │
│   │   ADMIN BACKEND     │          │   MAIN BACKEND      │             │
│   │   (Spring Boot)     │          │   (Spring Boot)     │             │
│   │   Port: 8081        │          │   Port: 8080        │             │
│   │                     │          │                     │             │
│   │  • AdminOrderCtrl   │          │  • OrderController  │             │
│   │  • Kafka PRODUCER ──┼──┐  ┌───┼── Kafka CONSUMER    │             │
│   │  • Read DB (shared) │  │  │   │  • Write DB         │             │
│   └──────────┬──────────┘  │  │   └──────────┬──────────┘             │
│              │              │  │              │                         │
│              │              ▼  ▼              │                         │
│              │     ┌────────────────┐         │                         │
│              │     │  order-status  │         │                         │
│              │     │  -events Topic │         │                         │
│              │     └────────────────┘         │                         │
│              │                                │                         │
│   ┌──────────┴────────────────────────────────┴──────────┐             │
│   │                  SHARED SERVICES                      │             │
│   │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │             │
│   │  │PostgreSQL│  │  Kafka   │  │  Zookeeper         │  │             │
│   │  │ (shared) │  │ (shared) │  │                    │  │             │
│   │  └──────────┘  └──────────┘  └────────────────────┘  │             │
│   └───────────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend Framework** | Spring Boot | 3.0.1 |
| **Java Version** | OpenJDK | 17 |
| **Database** | PostgreSQL | 15 (Alpine) |
| **ORM** | Spring Data JPA | (via Spring Boot) |
| **Auth** | JWT (jjwt) | 0.11.5 |
| **Messaging** | Apache Kafka | Confluent 7.5.0 |
| **Frontend Framework** | React | 18 |
| **Build Tool (Frontend)** | Vite | Latest |
| **CSS Framework** | Tailwind CSS | Latest |
| **State Management** | Zustand | Latest |
| **HTTP Client** | Axios | Latest |
| **Icons** | Lucide React | Latest |
| **Containerization** | Docker + Docker Compose | 3.8 |

---

## Project Structure

```
food-ordering-platform/
├── docker-compose.yml                    # All 8 services
├── API_GATEWAY_RESEARCH.md               # API Gateway research (future)
├── KAFKA_ADMIN_IMPLEMENTATION.md         # Kafka + Admin docs
├── SETUP_INSTRUCTIONS.md                 # Initial setup guide
│
├── food-ordering-backend/                # Main backend (customer-facing)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/foodordering/
│       ├── FoodOrderingApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── CorsConfig.java
│       │   ├── KafkaConsumerConfig.java
│       │   ├── KafkaProducerConfig.java
│       │   └── KafkaTopicConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── OrderController.java
│       │   ├── RestaurantController.java
│       │   └── PaymentController.java
│       ├── dto/
│       │   ├── kafka/OrderStatusEvent.java
│       │   └── request/ & response/
│       ├── model/                        # JPA entities
│       ├── repository/
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       └── service/
│           ├── OrderService.java
│           ├── OrderEventConsumer.java   # Kafka consumer
│           └── OrderEventProducer.java   # Kafka producer
│
├── food-ordering-frontend/               # Main frontend (customer-facing)
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                       # Routes: /, /login, /register, /orders
│       ├── main.jsx
│       ├── api/api.js                    # Base: http://localhost:8080/api
│       ├── components/
│       │   └── Navbar.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Orders.jsx
│       │   └── OrderDetail.jsx
│       └── store/authStore.js
│
├── admin-backend/                        # Admin microservice
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/foodordering/admin/
│       ├── AdminApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── CorsConfig.java
│       │   ├── KafkaProducerConfig.java
│       │   └── KafkaTopicConfig.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   └── AdminOrderController.java
│       ├── dto/kafka/OrderStatusEvent.java
│       ├── entity/                       # JPA entities (mirrors main backend)
│       ├── enums/
│       ├── repository/
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── CustomUserDetailsService.java
│       └── service/
│           ├── AdminOrderService.java
│           └── OrderEventProducer.java   # Kafka producer
│
└── admin-frontend/                       # Admin frontend
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.js
    └── src/
        ├── App.jsx                       # Routes: /admin/login, /admin, /admin/orders
        ├── main.jsx
        ├── api/api.js                    # Base: http://localhost:8081/api
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatusBadge.jsx
        │   └── StatusUpdateModal.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── AdminOrders.jsx
        │   └── AdminOrderDetail.jsx
        └── store/authStore.js
```

---

## Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| `postgres` | food-ordering-db | 5432 | PostgreSQL database (shared) |
| `zookeeper` | food-ordering-zookeeper | 2181 | Kafka Zookeeper |
| `kafka` | food-ordering-kafka | 9092 | Apache Kafka broker |
| `kafka-ui` | kafka-ui | 8082 | Kafka web UI |
| `backend` | food-ordering-backend | 8080 | Main Spring Boot API |
| `admin-backend` | admin-backend | 8081 | Admin Spring Boot API |
| `frontend` | food-ordering-frontend | 3000 | Customer React SPA |
| `admin-frontend` | admin-frontend | 3001 | Admin React SPA |

---

## Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f admin-backend
docker-compose logs -f kafka

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Backend (Java/Spring Boot)
```bash
# Run locally (without Docker)
cd food-ordering-backend
mvn clean install
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package -DskipTests
```

### Frontend (React/Vite)
```bash
# Install dependencies
cd food-ordering-frontend && npm install
cd admin-frontend && npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## API Endpoints

### Main Backend (8080)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/register` | No | - | Register new user |
| `POST` | `/api/auth/login` | No | - | Login and get JWT |
| `GET` | `/api/restaurants` | No | - | List all restaurants |
| `GET` | `/api/restaurants/{id}` | No | - | Get restaurant details |
| `GET` | `/api/restaurants/{id}/menu` | No | - | Get restaurant menu |
| `POST` | `/api/orders` | Yes | CUSTOMER | Create order |
| `GET` | `/api/orders` | Yes | CUSTOMER | Get customer's orders |
| `GET` | `/api/orders/{id}` | Yes | ANY | Get order by ID |
| `PATCH` | `/api/orders/{id}/status` | Yes | RESTAURANT_OWNER, DELIVERY_PARTNER, ADMIN | Update status |
| `POST` | `/api/payments/process/{orderId}` | Yes | CUSTOMER | Process payment |
| `GET` | `/api/payments/order/{orderId}` | Yes | ANY | Get payment by order |

### Admin Backend (8081)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/auth/login` | No | - | Admin login |
| `GET` | `/api/admin/orders` | Yes | ADMIN | List all orders (optional `?status=` filter) |
| `GET` | `/api/admin/orders/{id}` | Yes | ADMIN | Get any order by ID |
| `PATCH` | `/api/admin/orders/{id}/status` | Yes | ADMIN | Update order status via Kafka |
| `GET` | `/api/admin/orders/stats` | Yes | ADMIN | Get order counts by status |

---

## Order Status State Machine

```
PENDING_PAYMENT ──▶ PLACED ──▶ PREPARING ──▶ PICKED_UP ──▶ DELIVERED
       │                              │              │
       └──▶ CANCELLED                 └──▶ CANCELLED └──▶ CANCELLED
```

| Current Status | Allowed Next Statuses |
|----------------|----------------------|
| `PENDING_PAYMENT` | `PLACED`, `CANCELLED` |
| `PLACED` | `PREPARING`, `CANCELLED` |
| `PREPARING` | `PICKED_UP`, `CANCELLED` |
| `PICKED_UP` | `DELIVERED`, `CANCELLED` |
| `DELIVERED` | (terminal) |
| `CANCELLED` | (terminal) |

---

## Kafka Configuration

### Topic: `order-status-events`

| Property | Value |
|----------|-------|
| Partitions | 3 |
| Replication Factor | 1 |
| Key | `orderId` (UUID string) |
| Value | `OrderStatusEvent` JSON |

### Event Flow (Fire-and-Forget)
```
Admin clicks "Update to PREPARING"
        │
        ▼
Admin Backend (8081)
  AdminOrderController → AdminOrderService → OrderEventProducer → Kafka
        │
        │  (fire-and-forget, returns 200 immediately)
        │
        ▼
Kafka Topic: order-status-events
        │
        ▼
Main Backend (8080)
  OrderEventConsumer → validates transition → OrderRepository.save()
```

---

## Login Credentials

### Customer
- **Email:** `john@example.com`
- **Password:** `password123`

### Admin
- **Email:** `admin@foodapp.com`
- **Password:** `password123`

---

## Code Conventions

### Java/Spring Boot
- Package structure: `com.foodordering` (main), `com.foodordering.admin` (admin)
- DTOs in `dto/request/` and `dto/response/` for API contracts
- JPA entities in `model/` (main) or `entity/` (admin)
- JWT secret: hardcoded in `application.yml` (dev) - use env vars in production
- CORS: Currently configured in `CorsConfig.java` and `@CrossOrigin` on controllers
- Security: `csrf.disable()`, stateless sessions, JWT filter before `UsernamePasswordAuthenticationFilter`

### React/Vite
- Functional components with hooks
- Zustand for state management (`store/authStore.js`)
- Axios interceptors for JWT token handling
- Tailwind CSS for styling
- Lucide React for icons
- Vite proxies `/api` to backend in dev mode

### Docker
- Multi-stage builds for frontends (node → nginx)
- Health checks for postgres, zookeeper, kafka
- Named volumes for postgres data persistence
- Environment variables for service configuration

---

## Known Issues & Technical Debt

1. **JWT Incompatibility**: Main backend decodes secret as raw bytes, admin backend as Base64 - tokens are NOT interchangeable
2. **Triple CORS Config**: Spring Security bean + `@CrossOrigin` annotations + nginx headers - redundant
3. **No Rate Limiting**: Login/payment endpoints vulnerable to brute force
4. **Backends Exposed**: Ports 8080/8081 accessible on host, bypassing nginx
5. **No Request Tracing**: No correlation IDs across services
6. **No Circuit Breakers**: No fallback if a backend fails
7. **Hardcoded JWT Secret**: Should use Docker secrets or env vars in production
8. **No Token Refresh**: Tokens expire after 24h with no refresh mechanism

---

## Future Enhancements (Documented)

- **API Gateway**: See `API_GATEWAY_RESEARCH.md` for full analysis
  - Spring Cloud Gateway recommended
  - Redis-backed rate limiting
  - Centralized JWT validation
  - Circuit breaker with Resilience4j

---

## Testing

### Backend Tests
```bash
cd food-ordering-backend
mvn test
```

### Frontend Tests
```bash
cd food-ordering-frontend
npm test
```

### E2E Flow to Test
1. Register/Login as customer (`john@example.com`)
2. Browse restaurants
3. Place an order
4. Process payment
5. Login as admin (`admin@foodapp.com`)
6. View orders in admin dashboard
7. Update order status (should flow through Kafka to main backend)
8. Verify status updated on customer frontend

---

## Environment Variables

### Backend (food-ordering-backend)
| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/foodordering` | Database URL |
| `SPRING_DATASOURCE_USERNAME` | `fooduser` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `foodpass123` | Database password |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap servers |

### Admin Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Database host |
| `DB_USER` | `fooduser` | Database user |
| `DB_PASS` | `foodpass123` | Database password |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka bootstrap servers |
| `JWT_SECRET` | (hardcoded) | JWT signing secret |

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080/api` | Backend API URL (dev) |

---

*This file is maintained for LLM coding agents. Update when architecture changes.*
