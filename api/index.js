const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration for Vercel
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Always allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments (both preview and production)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      console.log('CORS: Allowing Vercel deployment:', origin);
      return callback(null, true);
    }
    
    // Allow any subdomain of vercel.app (for future deployments)
    if (origin.includes('.vercel.app')) {
      console.log('CORS: Allowing Vercel subdomain:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Logging middleware
app.use(morgan('combined'));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Add CORS headers to all responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always allow localhost for development
  if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:'))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Allow all Vercel deployments
  else if (origin && /^https:\/\/.*\.vercel\.app$/.test(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Allow any subdomain of vercel.app
  else if (origin && origin.includes('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      message: 'Xeno CRM API is running on Vercel',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
  });
});

// Mock API endpoints for testing
app.get('/api/customers/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalCustomers: 150,
      totalOrders: 320,
      totalRevenue: 45000,
      activeCampaigns: 5
    }
  });
});

app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', totalSpend: 1200 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', totalSpend: 800 }
    ]
  });
});

app.post('/api/auth/google', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({
      success: false,
      error: { message: 'Google token is required' },
    });
  }

  // Mock successful login
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://via.placeholder.com/150'
      },
      token: 'mock-jwt-token'
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'API endpoint not found' }
  });
});

module.exports = app;
