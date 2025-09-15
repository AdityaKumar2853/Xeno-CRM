import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'https://xeno-crm-backend-production.up.railway.app';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: { message: 'Message is required' },
      });
    }

    try {
      // Forward chat request to backend
      const response = await axios.post(`${BACKEND_URL}/api/chat/generate`, { message }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Chat API error:', error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        success: false,
        error: { message: 'Chat service unavailable' },
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
