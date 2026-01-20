# 🚀 Portfolio Backend API

[![NestJS](https://img.shields.io/badge/NestJS-v11.0+-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.0+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Latest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Cypress](https://img.shields.io/badge/Cypress-Latest-17202C?logo=cypress&logoColor=white)](https://www.cypress.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, enterprise-grade REST API backend for portfolio website built with NestJS, MongoDB, and comprehensive testing coverage.

## ✨ Features

### 🔐 Security & Authentication
- **JWT Authentication** - Secure token-based authentication
- **Bcrypt Password Hashing** - Industry-standard password encryption
- **Admin Panel Access Control** - Protected admin routes
- **CORS Configuration** - Cross-origin resource sharing control

### 📊 API Modules
- **Certifications** - Manage professional certifications
- **Contacts** - Handle contact form submissions
- **Courses** - Display educational background
- **Projects** - Showcase portfolio projects
- **Skills** - Manage technical skills and competencies
- **Health Check** - API health monitoring endpoint

### 🧪 Testing & Quality
- **Vitest** - Fast unit testing with coverage reporting
- **Cypress** - Comprehensive E2E API testing
- **ESLint** - Code quality and consistency enforcement
- **Prettier** - Automated code formatting
- **Security Auditing** - Automated dependency vulnerability scanning

### 📚 Documentation
- **Swagger/OpenAPI** - Interactive API documentation
- **TypeScript** - Full type safety and IntelliSense support
- **Class Validation** - Request/response validation with decorators

### 🚀 DevOps Ready
- **Docker** - Containerized deployment
- **Jenkins CI/CD** - Automated build and deployment pipeline
- **SonarQube** - Code quality analysis
- **Health Checks** - Readiness and liveness probes

## 📋 Prerequisites

- **Node.js**: v18.0.0+ (tested on Node v18/v20/v22)
- **npm**: v8.0.0+
- **MongoDB**: v6.0+ (local or cloud instance)
- **Docker**: Latest version (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/portfolio-backend.git
cd meu-site-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/portfolio
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=yourpassword
MONGO_INITDB_DATABASE=portfolio

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_EMAIL=admin@example.com
```

### 4. Initialize Database

```bash
# Seed initial data
npm run seed

# Or create admin user only
npm run create:admin
```

### 5. Start Development Server

```bash
# Development mode with hot-reload
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

The API will be available at `http://localhost:5000`

### 6. Access API Documentation

Open your browser and navigate to:
- **Swagger UI**: `http://localhost:5000/api`

## 📁 Project Structure

```
meu-site-backend/
├── cypress/                        # E2E tests
│   ├── e2e/
│   │   ├── api/                   # API endpoint tests
│   │   │   ├── certifications.cy.ts
│   │   │   ├── contacts.cy.ts
│   │   │   ├── courses.cy.ts
│   │   │   ├── health.cy.ts
│   │   │   ├── projects.cy.ts
│   │   │   └── skills.cy.ts
│   │   └── config-test.cy.ts
│   └── support/
│       ├── commands.ts             # Custom Cypress commands
│       └── e2e.ts
├── src/
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── schemas/          # MongoDB schemas
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── *.spec.ts         # Unit tests
│   │   ├── certifications/        # Certifications CRUD
│   │   ├── contacts/              # Contact form handler
│   │   ├── courses/               # Courses management
│   │   ├── projects/              # Projects showcase
│   │   └── skills/                # Skills management
│   ├── app.module.ts              # Root module
│   ├── app.spec.ts                # App tests
│   └── main.ts                    # Application entry point
├── cypress.config.mjs             # Cypress configuration
├── Dockerfile                      # Docker image definition
├── eslint.config.mjs              # ESLint configuration
├── Jenkinsfile                     # CI/CD pipeline
├── jenkinsPod.yaml                 # Jenkins Kubernetes pod
├── nest-cli.json                   # NestJS CLI configuration
├── package.json                    # Dependencies and scripts
├── sonar-project.properties        # SonarQube config
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.build.json             # Build TypeScript config
└── vitest.config.ts                # Vitest configuration
```

## 🔧 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in watch mode (hot-reload) |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:unit:watch` | Run unit tests in watch mode |
| `npm run test:unit:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:e2e` | Run E2E tests (starts server) |
| `npm run test:e2e:quick` | Run quick E2E tests |
| `npm run test:e2e:headed` | Open Cypress UI |
| `npm run test:api` | Run API tests only |
| `npm run lint` | Lint and fix code |
| `npm run lint:check` | Check linting without fixing |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run security` | Run security audit |
| `npm run seed` | Seed database with initial data |
| `npm run create:admin` | Create admin user |

## 🌍 API Endpoints

### Authentication
- `POST /auth/login` - Authenticate user
- `POST /auth/register` - Register new user (admin only)
- `GET /auth/profile` - Get authenticated user profile

### Public Endpoints
- `GET /health` - Health check endpoint
- `GET /certifications` - List all certifications
- `GET /courses` - List all courses
- `GET /projects` - List all projects
- `GET /skills` - List all skills
- `POST /contacts` - Submit contact form

### Admin Endpoints (Protected)
- `POST /certifications` - Create certification
- `PUT /certifications/:id` - Update certification
- `DELETE /certifications/:id` - Delete certification
- _(Similar CRUD operations for courses, projects, and skills)_

Full API documentation available at `/api` when running the server.

## 🔐 Security Considerations

### Authentication & Authorization
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ Protected admin routes with guards
- ✅ Environment-based configuration

### Best Practices Applied
- ✅ Input validation on all endpoints
- ✅ CORS configuration for allowed origins
- ✅ Helmet security headers (can be added)
- ✅ Rate limiting (can be added)
- ✅ Request size limits
- ✅ MongoDB injection prevention via Mongoose
- ✅ Regular security audits with `npm audit`

### Secrets Management
- ✅ No hardcoded credentials
- ✅ Environment variables for sensitive data
- ✅ `.env` files excluded from version control
- ✅ Separate configs for dev/test/prod

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t portfolio-backend:latest .
```

### Run Container

```bash
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/portfolio \
  -e JWT_SECRET=your-secret \
  --name portfolio-backend \
  portfolio-backend:latest
```

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/portfolio
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:8
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Run with:
```bash
docker-compose up -d
```

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:unit:watch

# With coverage
npm run test:coverage

# With UI
npm run test:unit:ui
```

### E2E Tests

```bash
# Run all E2E tests (auto-starts server)
npm run test:e2e

# Quick tests only
npm run test:e2e:quick

# Interactive mode
npm run test:e2e:headed

# API tests only
npm run test:api
```

### Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## 🛠️ Customization

### Adding New Modules

1. Generate module using NestJS CLI:
```bash
nest generate resource my-module
```

2. Choose REST API and generate CRUD endpoints

3. Add schema in `schemas/` directory:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MyEntity extends Document {
  @Prop({ required: true })
  name: string;
}

export const MyEntitySchema = SchemaFactory.createForClass(MyEntity);
```

4. Implement service, controller, and DTOs

5. Add tests:
```bash
# Unit tests
touch src/modules/my-module/my-module.service.spec.ts

# E2E tests
touch cypress/e2e/api/my-module.cy.ts
```

### Database Migrations

For schema changes:

```bash
# 1. Update schema in schemas/ directory
# 2. Run migration (if using migration tool)
# 3. Test with seed data
npm run seed
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI

# Restart MongoDB
sudo systemctl restart mongod
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Authentication Errors

```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Create new admin user
npm run create:admin

# Check token expiration
# JWT_EXPIRES_IN in .env
```

### Test Failures

```bash
# Clear test cache
rm -rf coverage/ .vitest/

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests in isolation
npm run test -- --run --reporter=verbose
```

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [API Design Guidelines](https://restfulapi.net/)

## 🔄 CI/CD Pipeline

The project includes Jenkins pipeline configuration:

```groovy
// Jenkinsfile stages:
1. Install dependencies
2. Lint code
3. Run unit tests
4. Run E2E tests
5. Security audit
6. Build Docker image
7. Push to registry
8. Deploy to environment
```

SonarQube integration for code quality metrics.

## 🤝 Acknowledgments

This project leverages the following amazing technologies:

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Vitest](https://vitest.dev/) - Lightning fast unit testing
- [Cypress](https://www.cypress.io/) - E2E testing framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Swagger](https://swagger.io/) - API documentation
- [Docker](https://www.docker.com/) - Containerization platform

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a portfolio project demonstrating best practices in backend development. While security measures are implemented, ensure proper security hardening and environment-specific configurations before deploying to production.

---

**Built with ❤️ for Modern Web Development**
