export default function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token is required' },
      });
    }

    // Mock token refresh - in production, generate new JWT token
    res.status(200).json({
      success: true,
      data: {
        token: 'mock-refreshed-token-' + Date.now(),
      },
    });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
