export default function handler(req, res) {
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/150'
        },
      },
    });
  } else if (req.method === 'PUT') {
    const { name, avatar } = req.body;
    
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: 1,
          name: name || 'Test User',
          email: 'test@example.com',
          avatar: avatar || 'https://via.placeholder.com/150'
        },
      },
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
