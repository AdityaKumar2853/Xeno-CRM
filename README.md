# Xeno CRM - Mini CRM Platform

A full-stack CRM application built with Node.js, Next.js, MySQL, and Docker.

## Features

- ✅ **Customer Management** - Full CRUD operations for customers
- ✅ **Order Management** - Complete order tracking and management
- ✅ **Real-time Dashboard** - Live statistics and analytics
- ✅ **Authentication** - Google OAuth 2.0 and test login
- ✅ **Responsive UI** - Modern, mobile-friendly interface
- ✅ **Search & Filter** - Advanced search capabilities
- ✅ **Docker Support** - Easy deployment with Docker Compose

## Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API framework
- **Prisma** ORM for database management
- **MySQL** database
- **Redis** for caching and message queues
- **JWT** for authentication

### Frontend
- **Next.js** with React
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hot Toast** for notifications

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Nginx** for reverse proxy

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/AdityaKumar2853/Xeno-CRM.git
cd Xeno-CRM
```

### 2. Environment Setup
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://mini_crm:mini_crm_password@localhost:3307/mini_crm
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-jwt-secret-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# API Configuration
API_PORT=3001
FRONTEND_URL=http://localhost:3000
VENDOR_API_URL=http://localhost:3002

# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Start the Application
```bash
docker-compose up -d
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:3307

## Usage

### Login
1. Open http://localhost:3000
2. Click "Test Login (Bypass Google OAuth)" for development
3. Or configure Google OAuth for production use

### Customer Management
- **Add Customer**: Click "Add Customer" button
- **Edit Customer**: Click "Edit" button on any customer row
- **Delete Customer**: Click "Delete" button with confirmation
- **Search**: Use the search box to filter customers

### Order Management
- **Add Order**: Click "Add Order" button
- **Edit Order**: Click "Edit" button on any order row
- **Delete Order**: Click "Delete" button with confirmation
- **Search**: Use the search box to filter orders

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/stats` - Get customer statistics

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/stats` - Get order statistics

## Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Management
```bash
# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

## Production Deployment

1. Set up your production environment variables
2. Configure your domain and SSL certificates
3. Update the CORS and frontend URLs
4. Run `docker-compose up -d`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.