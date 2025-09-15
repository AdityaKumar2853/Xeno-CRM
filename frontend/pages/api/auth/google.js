export default function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Google token is required' },
      });
    }

    // Mock successful login
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/150'
        },
        token: 'mock-jwt-token-' + Date.now()
      },
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
