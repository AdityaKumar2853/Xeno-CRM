export default function handler(req, res) {
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token is required' },
      });
    }

    // Mock token verification - in production, verify JWT token
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/150'
        },
        valid: true,
      },
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
