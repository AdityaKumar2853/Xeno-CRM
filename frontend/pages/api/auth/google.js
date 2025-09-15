import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  console.log('🔐 Google OAuth API called:', {
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    referer: req.headers.referer,
  });

  if (req.method === 'POST') {
    const { token } = req.body;
    
    console.log('📝 Request body:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
    });
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({
        success: false,
        error: { message: 'Google token is required' },
      });
    }

    try {
      console.log('🔑 Environment check:', {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
      });

      // Verify the Google token
      console.log('🔍 Verifying Google token...');
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log('✅ Google token verified successfully:', {
        hasPayload: !!payload,
        userId: payload?.sub,
        email: payload?.email,
        name: payload?.name,
        emailVerified: payload?.email_verified,
        audience: payload?.aud,
        issuer: payload?.iss,
        issuedAt: payload?.iat,
        expiresAt: payload?.exp,
      });

      if (!payload) {
        console.log('❌ No payload in Google token');
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

      console.log('👤 Created user object:', user);

      // Create a simple JWT token (in production, use a proper JWT library)
      const jwtPayload = {
        userId: user.id,
        email: user.email,
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };
      
      const jwtToken = Buffer.from(JSON.stringify(jwtPayload)).toString('base64');
      
      console.log('🎫 JWT token created:', {
        payload: jwtPayload,
        tokenLength: jwtToken.length,
      });

      const response = {
        success: true,
        data: {
          user,
          token: jwtToken,
        },
      };

      console.log('✅ Login successful, sending response:', {
        success: response.success,
        userId: response.data.user.id,
        userEmail: response.data.user.email,
        hasToken: !!response.data.token,
      });

      res.status(200).json(response);
    } catch (error) {
      console.error('❌ Google OAuth error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      });
      res.status(400).json({
        success: false,
        error: { message: 'Google authentication failed' },
      });
    }
  } else {
    console.log('❌ Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
