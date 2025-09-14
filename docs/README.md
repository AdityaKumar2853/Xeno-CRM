# Mini CRM Platform

A comprehensive Mini CRM Platform with customer segmentation, campaign delivery, and AI insights built with modern tools and approaches.

## 🚀 Features

### ✅ Core Features
- **Data Ingestion APIs**: Secure, well-documented REST APIs for customer and order data
- **Pub-Sub Architecture**: Asynchronous data processing using message queues
- **Campaign Creation UI**: Dynamic rule builder for audience segmentation
- **Campaign Delivery & Logging**: Real-time delivery tracking with vendor simulation
- **Google OAuth Authentication**: Secure user authentication
- **AI Integration**: Multiple AI-powered features for enhanced user experience

### 🧠 AI Features
1. **Natural Language to Segment Rules**: Convert prompts like "People who haven't shopped in 6 months and spent over ₹5K" into logical rules
2. **AI-Driven Message Suggestions**: Generate personalized message variants based on campaign objectives
3. **Campaign Performance Summarization**: Human-readable insights and recommendations
4. **Smart Scheduling Suggestions**: Optimal timing recommendations based on customer patterns
5. **Audience Lookalike Generator**: Suggest similar audiences based on high-performing segments
6. **Auto-tagging Campaigns**: Automatic campaign categorization using AI

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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0+
- Redis 6+

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd mini-crm
```

2. **Set up environment variables**
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

3. **Start with Docker Compose**
```bash
docker-compose up -d
```

4. **Or run locally**
```bash
# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../vendor-simulator && npm install

# Start services
npm run dev
```

### Database Setup

1. **Run migrations**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

2. **Generate Prisma client**
```bash
npx prisma generate
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Data Ingestion Endpoints
- `POST /api/ingest/customers` - Create customer (sync)
- `POST /api/ingest/customers/async` - Create customer (async)
- `POST /api/ingest/customers/batch` - Create multiple customers
- `POST /api/ingest/orders` - Create order (sync)
- `POST /api/ingest/orders/async` - Create order (async)
- `POST /api/ingest/orders/batch` - Create multiple orders

### Segment Management Endpoints
- `GET /api/segments` - List segments
- `POST /api/segments` - Create segment
- `GET /api/segments/:id` - Get segment details
- `PUT /api/segments/:id` - Update segment
- `DELETE /api/segments/:id` - Delete segment
- `POST /api/segments/preview` - Preview segment audience
- `POST /api/segments/:id/build` - Build segment

### Campaign Management Endpoints
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign
- `POST /api/campaigns/:id/resume` - Resume campaign
- `POST /api/campaigns/:id/cancel` - Cancel campaign

### AI Integration Endpoints
- `POST /api/ai/parse-rules` - Parse natural language to rules
- `POST /api/ai/message-suggestions` - Generate message suggestions
- `GET /api/ai/performance-summary/:campaignId` - Get performance summary
- `POST /api/ai/suggest-scheduling` - Suggest optimal scheduling
- `GET /api/ai/lookalike-audience/:segmentId` - Generate lookalike audience
- `GET /api/ai/auto-tag/:campaignId` - Auto-tag campaign

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
# Run all tests
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

### Metrics
- API response times
- Database query performance
- Redis cache hit rates
- Message queue processing rates

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

### Phase 1 (Current)
- ✅ Core CRM functionality
- ✅ AI integration
- ✅ Campaign management
- ✅ Data ingestion

### Phase 2 (Future)
- 📊 Advanced analytics dashboard
- 🔔 Real-time notifications
- 📱 Mobile app
- 🌐 Multi-tenant support
- 🔌 Plugin system
- 📈 Advanced AI features

---

Built with ❤️ using modern web technologies.
