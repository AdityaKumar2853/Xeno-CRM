const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  console.log('Health check requested at:', new Date().toISOString());
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Simple server is running'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      message: 'Xeno CRM API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Xeno CRM Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server started on port ${PORT}`);
  console.log(`🔍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📊 API health: http://0.0.0.0:${PORT}/api/health`);
});

module.exports = app;
