const axios = require('axios');

// Test API endpoints
const baseURL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');
  
  try {
    // Test segments endpoint
    console.log('1. Testing segments endpoint...');
    try {
      const segmentsResponse = await axios.get(`${baseURL}/segments`);
      console.log('✅ Segments GET:', segmentsResponse.status, segmentsResponse.data.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ Segments GET failed:', error.response?.status, error.message);
    }

    // Test campaigns endpoint
    console.log('\n2. Testing campaigns endpoint...');
    try {
      const campaignsResponse = await axios.get(`${baseURL}/campaigns`);
      console.log('✅ Campaigns GET:', campaignsResponse.status, campaignsResponse.data.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ Campaigns GET failed:', error.response?.status, error.message);
    }

    // Test customers endpoint
    console.log('\n3. Testing customers endpoint...');
    try {
      const customersResponse = await axios.get(`${baseURL}/customers`);
      console.log('✅ Customers GET:', customersResponse.status, customersResponse.data.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ Customers GET failed:', error.response?.status, error.message);
    }

    // Test orders endpoint
    console.log('\n4. Testing orders endpoint...');
    try {
      const ordersResponse = await axios.get(`${baseURL}/orders`);
      console.log('✅ Orders GET:', ordersResponse.status, ordersResponse.data.success ? 'SUCCESS' : 'FAILED');
    } catch (error) {
      console.log('❌ Orders GET failed:', error.response?.status, error.message);
    }

    // Test creating a segment
    console.log('\n5. Testing segment creation...');
    try {
      const segmentData = {
        name: 'Test Segment',
        description: 'Test segment for API testing',
        rules: JSON.stringify([{ field: 'totalSpent', operator: 'gte', value: 100 }])
      };
      
      const createSegmentResponse = await axios.post(`${baseURL}/segments`, segmentData);
      console.log('✅ Segment POST:', createSegmentResponse.status, createSegmentResponse.data.success ? 'SUCCESS' : 'FAILED');
      
      if (createSegmentResponse.data.success) {
        console.log('   Created segment ID:', createSegmentResponse.data.data.id);
      }
    } catch (error) {
      console.log('❌ Segment POST failed:', error.response?.status, error.response?.data?.error?.message || error.message);
    }

    console.log('\n🎉 API endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testEndpoints();
