# 🚀 Mini CRM Platform

A comprehensive Mini CRM Platform with customer segmentation, personalized campaign delivery, and intelligent insights using modern tools and approaches.

## ✨ Features

### 🎯 Core Features
- **🔐 Google OAuth Authentication** - Secure user authentication
- **📊 Data Ingestion APIs** - RESTful APIs for customer and order data with pub-sub architecture
- **🎨 Campaign Creation UI** - Dynamic rule builder for audience segmentation
- **📧 Campaign Delivery & Logging** - Real-time delivery tracking with vendor simulation
- **🤖 AI Integration** - Multiple AI-powered features for enhanced user experience

### 🧠 AI-Powered Features
1. **🗣️ Natural Language to Segment Rules** - Convert prompts like "People who haven't shopped in 6 months and spent over ₹5K" into logical rules
2. **💬 AI-Driven Message Suggestions** - Generate personalized message variants based on campaign objectives
3. **📈 Campaign Performance Summarization** - Human-readable insights and recommendations
4. **⏰ Smart Scheduling Suggestions** - Optimal timing recommendations based on customer patterns
5. **👥 Audience Lookalike Generator** - Suggest similar audiences based on high-performing segments
6. **🏷️ Auto-tagging Campaigns** - Automatic campaign categorization using AI

## 🏗️ Architecture

### Backend (Node.js + TypeScript)
- **Express.js** REST API with comprehensive error handling
- **Prisma ORM** with MySQL database
- **Redis** for caching and message queuing
- **JWT Authentication** with Google OAuth integration
- **Message Queue System** for asynchronous processing
- **AI Integration** with OpenAI GPT models

### Frontend (Next.js + React)
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** with validation
- **Google OAuth** integration
- **Responsive Design** with modern UI components

### Infrastructure
- **Docker** containerization
- **Docker Compose** for local development
- **Nginx** reverse proxy
- **MySQL** database
- **Redis** cache and message broker

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0+
- Redis 6+

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mini-crm
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/mini_crm"
REDIS_URL="redis://localhost:6379"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-jwt-secret-key"

# AI
OPENAI_API_KEY="your-openai-api-key"

# API Configuration
API_PORT=3001
FRONTEND_URL="http://localhost:3000"
VENDOR_API_URL="http://localhost:3002"
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```

### 4. Or Run Locally
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../vendor-simulator && npm install

# Start services
npm run dev
```

### 5. Database Setup
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
npx prisma generate
```

## 📁 Project Structure

```
mini-crm/
├── backend/                # Node.js + TypeScript API
│   ├── src/
│   │   ├── api/            # Express routes & controllers
│   │   ├── services/       # Business logic layer
│   │   ├── workers/        # Async consumers
│   │   ├── models/         # Database schemas
│   │   └── utils/          # Helper functions
│   └── prisma/             # Database schema
├── frontend/               # Next.js React app
│   ├── pages/              # Next.js pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # API client & utilities
├── vendor-simulator/       # Mock vendor API
├── infra/                  # Docker & deployment
└── docs/                   # Documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Data Ingestion
- `POST /api/ingest/customers` - Create customer (sync/async)
- `POST /api/ingest/orders` - Create order (sync/async)
- `POST /api/ingest/customers/batch` - Create multiple customers
- `POST /api/ingest/orders/batch` - Create multiple orders

### Segment Management
- `GET /api/segments` - List segments
- `POST /api/segments` - Create segment
- `POST /api/segments/preview` - Preview segment audience
- `POST /api/segments/:id/build` - Build segment

### Campaign Management
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `GET /api/campaigns/:id/insights` - Get AI insights

### AI Integration
- `POST /api/ai/parse-rules` - Parse natural language to rules
- `POST /api/ai/message-suggestions` - Generate message suggestions
- `GET /api/ai/performance-summary/:id` - Get performance summary
- `POST /api/ai/suggest-scheduling` - Suggest optimal scheduling
- `GET /api/ai/lookalike-audience/:id` - Generate lookalike audience
- `GET /api/ai/auto-tag/:id` - Auto-tag campaign

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Tests
```bash
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
1. Set up production environment variables
2. Configure SSL certificates
3. Set up database backups
4. Configure monitoring and logging
5. Deploy using Docker or Kubernetes

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /` (implicit)
- Vendor: `GET /health`

### Logging
- Structured logging with Winston
- Log levels: error, warn, info, debug
- Log files: `logs/error.log`, `logs/combined.log`

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Husky pre-commit hooks

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Create pull request
5. Code review
6. Merge to main

## 📚 Documentation

- [API Documentation](docs/openapi.yaml) - OpenAPI 3.0 specification
- [Postman Collection](docs/postman_collection.json) - API testing collection
- [Database Schema](docs/ERD.png) - Entity Relationship Diagram
- [Detailed README](docs/README.md) - Comprehensive documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔮 Roadmap

### Phase 1 (Current) ✅
- Core CRM functionality
- AI integration
- Campaign management
- Data ingestion

### Phase 2 (Future) 🚀
- Advanced analytics dashboard
- Real-time notifications
- Mobile app
- Multi-tenant support
- Plugin system
- Advanced AI features

---

## 🎯 Key Highlights

### ✅ Brownie Points Implemented
- **Pub-Sub Architecture**: Asynchronous data processing using message queues
- **Batch Processing**: Efficient handling of bulk operations
- **AI Integration**: Multiple AI-powered features for enhanced UX
- **Clean UI/UX**: Modern, responsive design with intuitive user experience
- **Comprehensive Documentation**: OpenAPI specs, Postman collection, and detailed docs
- **Production Ready**: Docker containerization, health checks, and monitoring

### 🛠️ Modern Tech Stack
- **Backend**: Node.js, TypeScript, Express.js, Prisma, Redis
- **Frontend**: Next.js, React, Tailwind CSS, React Query
- **Database**: MySQL with Prisma ORM
- **AI**: OpenAI GPT integration
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Authentication**: Google OAuth 2.0

Built with ❤️ using modern web technologies and best practices.
