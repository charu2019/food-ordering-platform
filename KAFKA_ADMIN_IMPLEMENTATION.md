# Kafka Integration & Admin Microservice

## Overview

This document captures the complete implementation of:
1. **Apache Kafka** integration for async order state management
2. **Admin Microservice** - a standalone Spring Boot service for admin order management
3. **Admin Frontend** - a separate React app with its own login and UI

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

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Message Broker | Apache Kafka | Confluent 7.5.0 |
| Zookeeper | Confluent CP-Zookeeper | 7.5.0 |
| Kafka Client | Spring Kafka | (via Spring Boot 3.0.1) |
| Admin Backend | Spring Boot 3.0.1 | Java 17 |
| Admin Frontend | React + Vite | Tailwind CSS |

## Microservice Responsibilities

### Main Backend (Port 8080)
- Customer-facing API (create order, get my orders, process payment)
- Kafka **consumer** - listens to order status events and persists them
- Kafka **producer** - for restaurant owner/delivery partner status updates
- Manages: restaurants, menu items, customers

### Admin Backend (Port 8081)
- Admin-facing API (view all orders, update status, get stats)
- Kafka **producer** - publishes order status update events
- Read-only access to shared database (except via Kafka events)
- Dedicated admin authentication (ADMIN role only)

## Kafka Configuration

### Topic Design

| Property | Value |
|----------|-------|
| Topic Name | `order-status-events` |
| Partitions | 3 |
| Replication Factor | 1 |
| Key | `orderId` (UUID string) |
| Value | `OrderStatusEvent` JSON |

### Producer Config (Admin Backend)
- Key Serializer: `StringSerializer`
- Value Serializer: `JsonSerializer`
- ACKs: `all`
- Retries: 3

### Consumer Config (Main Backend)
- Group ID: `order-status-group`
- Auto Offset Reset: `earliest`
- Value Deserializer: `JsonDeserializer`
- ACK Mode: `manual-immediate`

## Order Status State Machine

```
PENDING_PAYMENT ──▶ PLACED ──▶ PREPARING ──▶ PICKED_UP ──▶ DELIVERED
      │                              │              │
      └──▶ CANCELLED                 └──▶ CANCELLED └──▶ CANCELLED
```

### Valid Transitions

| Current Status | Allowed Next Statuses |
|---|---|
| `PENDING_PAYMENT` | `PLACED`, `CANCELLED` |
| `PLACED` | `PREPARING`, `CANCELLED` |
| `PREPARING` | `PICKED_UP`, `CANCELLED` |
| `PICKED_UP` | `DELIVERED`, `CANCELLED` |
| `DELIVERED` | (terminal) |
| `CANCELLED` | (terminal) |

## Event Flow (Fire-and-Forget)

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

## API Endpoints

### Main Backend (8080)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login and get JWT |
| `POST` | `/api/orders` | CUSTOMER | Create order |
| `GET` | `/api/orders` | CUSTOMER | Get customer's orders |
| `GET` | `/api/orders/{id}` | Authenticated | Get order by ID |
| `PATCH` | `/api/orders/{id}/status` | RESTAURANT_OWNER, DELIVERY_PARTNER | Update status |
| `POST` | `/api/payments/process/{orderId}` | CUSTOMER | Process payment |

### Admin Backend (8081)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | Public | Admin login |
| `GET` | `/api/admin/orders` | ADMIN | List all orders (optional `?status=` filter) |
| `GET` | `/api/admin/orders/{id}` | ADMIN | Get any order by ID |
| `PATCH` | `/api/admin/orders/{id}/status` | ADMIN | Update order status via Kafka |
| `GET` | `/api/admin/orders/stats` | ADMIN | Get order counts by status |

## Frontend Routes

### Customer Frontend (3000)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Restaurant listing |
| `/login` | Login | Customer login |
| `/register` | Register | Customer registration |
| `/orders` | Orders | Customer order history |
| `/orders/:id` | OrderDetail | Order tracking |

### Admin Frontend (3001)

| Path | Component | Description |
|------|-----------|-------------|
| `/admin/login` | Login | Admin login (blue theme) |
| `/admin` | Dashboard | Stats overview |
| `/admin/orders` | AdminOrders | Order management with filters |
| `/admin/orders/:id` | AdminOrderDetail | Order detail with status controls |

## Login Credentials

### Customer
- **Email:** `john@example.com`
- **Password:** `password123`

### Admin
- **Email:** `admin@foodapp.com`
- **Password:** `password123`

## Project Structure

```
food-ordering-platform/
├── docker-compose.yml
├── food-ordering-backend/          # Main backend (customer-facing)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/foodordering/
│       ├── controller/OrderController.java
│       ├── service/OrderService.java
│       ├── service/OrderEventConsumer.java
│       ├── service/OrderEventProducer.java
│       └── ...
├── food-ordering-frontend/         # Main frontend (customer-facing)
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── pages/Orders.jsx
│       ├── pages/OrderDetail.jsx
│       └── ...
├── admin-backend/                  # Admin microservice (NEW)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/foodordering/admin/
│       ├── controller/AdminOrderController.java
│       ├── controller/AuthController.java
│       ├── service/AdminOrderService.java
│       ├── service/OrderEventProducer.java
│       └── ...
└── admin-frontend/                 # Admin frontend (NEW)
    ├── package.json
    ├── Dockerfile
    └── src/
        ├── pages/Login.jsx
        ├── pages/Dashboard.jsx
        ├── pages/AdminOrders.jsx
        └── ...
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database (shared) |
| `zookeeper` | 2181 | Kafka Zookeeper |
| `kafka` | 9092 | Apache Kafka broker |
| `backend` | 8080 | Main Spring Boot API (customer) |
| `admin-backend` | 8081 | Admin Spring Boot API |
| `frontend` | 3000 | Customer React SPA |
| `admin-frontend` | 3001 | Admin React SPA |

## Running the System

```bash
# Start all services
docker-compose up -d

# Access applications
Customer: http://localhost:3000
Admin:    http://localhost:3001

# Check logs
docker-compose logs -f backend
docker-compose logs -f admin-backend
```
