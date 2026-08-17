#!/bin/bash

# Food Ordering Platform - Complete Project Setup Script
# This script creates the entire project structure with all files

set -e

echo "🚀 Setting up Food Ordering Platform..."

# Create root directory
mkdir -p food-ordering-platform
cd food-ordering-platform

# ============================================
# BACKEND SETUP
# ============================================
echo "📦 Creating backend structure..."

mkdir -p food-ordering-backend/src/main/java/com/foodordering/{config,controller,dto/{auth,order,restaurant,menu,payment},exception,model/{entity,enums},repository,security,service}
mkdir -p food-ordering-backend/src/main/resources/db/migration
mkdir -p food-ordering-backend/src/test/java/com/foodordering

# ============================================
# FRONTEND SETUP
# ============================================
echo "📦 Creating frontend structure..."

mkdir -p food-ordering-frontend/src/{api,components,pages,store}
mkdir -p food-ordering-frontend/public

# ============================================
# CREATE BACKEND FILES
# ============================================
echo "📝 Creating backend configuration files..."

# pom.xml
cat > food-ordering-backend/pom.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>
    
    <groupId>com.foodordering</groupId>
    <artifactId>food-ordering-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>Food Ordering Platform</name>
    <description>Production-ready food ordering platform backend</description>
    
    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.3</jjwt.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
EOF

# application.yml
cat > food-ordering-backend/src/main/resources/application.yml << 'EOF'
spring:
  application:
    name: food-ordering-platform
  datasource:
    url: jdbc:postgresql://localhost:5432/foodordering
    username: fooduser
    password: foodpass123
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    baseline-on-migrate: true

app:
  jwt:
    secret: your-256-bit-secret-key-change-this-in-production-please-make-it-long
    expiration: 86400000
  cors:
    allowed-origins: http://localhost:3000,http://localhost:5173

server:
  port: 8080

logging:
  level:
    com.foodordering: DEBUG
EOF

echo "✅ Backend structure created!"

# ============================================
# CREATE FRONTEND FILES
# ============================================
echo "📝 Creating frontend configuration files..."

# package.json
cat > food-ordering-frontend/package.json << 'EOF'
{
  "name": "food-ordering-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "axios": "^1.6.5",
    "zustand": "^4.4.7",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.303.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
EOF

# vite.config.js
cat > food-ordering-frontend/vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
EOF

# tailwind.config.js
cat > food-ordering-frontend/tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        }
      }
    },
  },
  plugins: [],
}
EOF

# postcss.config.js
cat > food-ordering-frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# index.html
cat > food-ordering-frontend/index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Food Ordering Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# .env
cat > food-ordering-frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8080/api
EOF

echo "✅ Frontend structure created!"

# ============================================
# CREATE DOCKER FILES
# ============================================
echo "📝 Creating Docker configuration..."

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: food-ordering-db
    environment:
      POSTGRES_DB: foodordering
      POSTGRES_USER: fooduser
      POSTGRES_PASSWORD: foodpass123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Backend Dockerfile
cat > food-ordering-backend/Dockerfile << 'EOF'
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF

# Frontend Dockerfile
cat > food-ordering-frontend/Dockerfile << 'EOF'
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

echo "✅ Docker files created!"

# ============================================
# CREATE DOCUMENTATION
# ============================================
echo "📝 Creating documentation..."

cat > README.md << 'EOF'
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
EOF

cat > SETUP_INSTRUCTIONS.md << 'EOF'
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
EOF

echo "✅ Documentation created!"

# ============================================
# CREATE .gitignore
# ============================================
cat > .gitignore << 'EOF'
# Backend
food-ordering-backend/target/
food-ordering-backend/.mvn/
food-ordering-backend/mvnw
food-ordering-backend/mvnw.cmd

# Frontend
food-ordering-frontend/node_modules/
food-ordering-frontend/dist/
food-ordering-frontend/.env.local

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
EOF

cat > food-ordering-backend/.gitignore << 'EOF'
target/
.mvn/
*.log
EOF

cat > food-ordering-frontend/.gitignore << 'EOF'
node_modules/
dist/
.env.local
EOF

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📁 Directory structure:"
tree -L 3 -I 'node_modules|target' || ls -R

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Copy all Java source files from the chat artifacts to:"
echo "   food-ordering-backend/src/main/java/com/foodordering/"
echo ""
echo "2. Copy database migration SQL to:"
echo "   food-ordering-backend/src/main/resources/db/migration/"
echo ""
echo "3. Copy React source files from chat artifacts to:"
echo "   food-ordering-frontend/src/"
echo ""
echo "4. Read SETUP_INSTRUCTIONS.md for detailed file mapping"
echo ""
echo "5. Setup PostgreSQL database:"
echo "   psql -U postgres"
echo "   CREATE DATABASE foodordering;"
echo "   CREATE USER fooduser WITH PASSWORD 'foodpass123';"
echo "   GRANT ALL PRIVILEGES ON DATABASE foodordering TO fooduser;"
echo ""
echo "6. Run the application:"
echo "   cd food-ordering-backend && mvn spring-boot:run"
echo "   cd food-ordering-frontend && npm install && npm run dev"
echo ""
echo "📄 See SETUP_INSTRUCTIONS.md for complete file list to copy from chat!"
echo ""
