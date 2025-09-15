import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { message: 'Google token is required' },
      });
    }

    try {
      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid Google token' },
        });
      }

      // Create user data from Google payload
      const user = {
        id: payload.sub,
        name: payload.name || '',
        email: payload.email || '',
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=3b82f6&color=ffffff&size=150`,
      };

      // Create a simple JWT token (in production, use a proper JWT library)
      const jwtToken = Buffer.from(JSON.stringify({
        userId: user.id,
        email: user.email,
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      })).toString('base64');

      res.status(200).json({
        success: true,
        data: {
          user,
          token: jwtToken,
        },
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(400).json({
        success: false,
        error: { message: 'Google authentication failed' },
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
