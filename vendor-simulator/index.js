const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;
const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:3001';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Simulate 90% success rate, 10% failure rate
const SUCCESS_RATE = 0.9;

// Store pending deliveries for callback simulation
const pendingDeliveries = new Map();

// Simulate delivery delay (1-5 seconds)
const getRandomDelay = () => Math.floor(Math.random() * 4000) + 1000;

// Simulate delivery success/failure
const shouldSucceed = () => Math.random() < SUCCESS_RATE;

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'vendor-simulator',
      successRate: SUCCESS_RATE,
    },
  });
});

// Vendor send endpoint
app.post('/vendor/send', async (req, res) => {
  try {
    const { customerId, customerName, customerEmail, message, campaignId } = req.body;

    // Validate required fields
    if (!customerId || !customerEmail || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerId, customerEmail, message',
      });
    }

    // Generate vendor ID
    const vendorId = uuidv4();

    // Store delivery info for callback
    const deliveryInfo = {
      vendorId,
      customerId,
      customerName,
      customerEmail,
      message,
      campaignId,
      timestamp: new Date(),
    };

    pendingDeliveries.set(vendorId, deliveryInfo);

    // Simulate processing delay
    const delay = getRandomDelay();
    
    setTimeout(async () => {
      try {
        const success = shouldSucceed();
        
        if (success) {
          // Simulate successful delivery
          await sendDeliveryReceipt(vendorId, 'delivered');
          console.log(`✅ Message delivered successfully: ${vendorId}`);
        } else {
          // Simulate delivery failure
          await sendDeliveryReceipt(vendorId, 'failed');
          console.log(`❌ Message delivery failed: ${vendorId}`);
        }
      } catch (error) {
        console.error('Error processing delivery callback:', error);
      }
    }, delay);

    // Return immediate response
    res.json({
      success: true,
      data: {
        vendorId,
        status: 'accepted',
        message: 'Message accepted for delivery',
        estimatedDeliveryTime: `${Math.ceil(delay / 1000)} seconds`,
      },
    });

    console.log(`📤 Message accepted for delivery: ${vendorId} (${customerEmail})`);

  } catch (error) {
    console.error('Error processing send request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Send delivery receipt to CRM API
async function sendDeliveryReceipt(vendorId, status) {
  try {
    const deliveryInfo = pendingDeliveries.get(vendorId);
    
    if (!deliveryInfo) {
      console.error('Delivery info not found for vendorId:', vendorId);
      return;
    }

    const receiptData = {
      logId: vendorId, // In real implementation, this would be the actual log ID
      vendorId,
      status,
      ...(status === 'failed' && { 
        failureReason: 'Simulated delivery failure' 
      }),
    };

    // Send receipt to CRM API
    const response = await axios.post(
      `${CRM_API_URL}/api/delivery/receipt`,
      receiptData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vendor-Simulator/1.0',
        },
      }
    );

    if (response.data.success) {
      console.log(`📨 Delivery receipt sent successfully: ${vendorId} (${status})`);
    } else {
      console.error('Failed to send delivery receipt:', response.data);
    }

    // Clean up
    pendingDeliveries.delete(vendorId);

  } catch (error) {
    console.error('Error sending delivery receipt:', error);
    
    // Retry logic could be implemented here
    setTimeout(() => {
      sendDeliveryReceipt(vendorId, status);
    }, 5000);
  }
}

// Get pending deliveries (for debugging)
app.get('/vendor/pending', (req, res) => {
  const pending = Array.from(pendingDeliveries.values());
  
  res.json({
    success: true,
    data: {
      count: pending.length,
      deliveries: pending,
    },
  });
});

// Get vendor stats
app.get('/vendor/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      successRate: SUCCESS_RATE,
      pendingDeliveries: pendingDeliveries.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Simulate bulk delivery
app.post('/vendor/send/bulk', async (req, res) => {
  try {
    const { deliveries } = req.body;

    if (!Array.isArray(deliveries) || deliveries.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Deliveries array is required and must not be empty',
      });
    }

    if (deliveries.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 deliveries allowed per batch',
      });
    }

    const results = [];

    for (const delivery of deliveries) {
      try {
        const { customerId, customerName, customerEmail, message, campaignId } = delivery;

        if (!customerId || !customerEmail || !message) {
          results.push({
            success: false,
            error: 'Missing required fields',
            delivery,
          });
          continue;
        }

        const vendorId = uuidv4();
        const deliveryInfo = {
          vendorId,
          customerId,
          customerName,
          customerEmail,
          message,
          campaignId,
          timestamp: new Date(),
        };

        pendingDeliveries.set(vendorId, deliveryInfo);

        // Simulate processing delay
        const delay = getRandomDelay();
        
        setTimeout(async () => {
          try {
            const success = shouldSucceed();
            await sendDeliveryReceipt(vendorId, success ? 'delivered' : 'failed');
          } catch (error) {
            console.error('Error processing bulk delivery callback:', error);
          }
        }, delay);

        results.push({
          success: true,
          vendorId,
          status: 'accepted',
          estimatedDeliveryTime: `${Math.ceil(delay / 1000)} seconds`,
        });

      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          delivery,
        });
      }
    }

    res.json({
      success: true,
      data: {
        total: deliveries.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results,
      },
    });

    console.log(`📦 Bulk delivery processed: ${deliveries.length} messages`);

  } catch (error) {
    console.error('Error processing bulk delivery:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Vendor Simulator running on port ${PORT}`);
  console.log(`📊 Success rate: ${(SUCCESS_RATE * 100).toFixed(1)}%`);
  console.log(`🔗 CRM API URL: ${CRM_API_URL}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('Vendor Simulator stopped');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
