import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create Prisma client with Railway database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS@yamanote.proxy.rlwy.net:23968/railway'
    }
  }
});

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
        origin: req.headers.origin,
        referer: req.headers.referer,
        host: req.headers.host,
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

      // Find or create user in database
      console.log('🔍 Looking for existing user in database...');
      let user = await prisma.user.findUnique({
        where: { googleId: payload.sub }
      });

      if (!user) {
        console.log('👤 User not found, creating new user...');
        user = await prisma.user.create({
          data: {
            id: payload.sub, // Use Google ID as primary key
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || '',
            avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=3b82f6&color=ffffff&size=150`,
          }
        });
        console.log('✅ New user created:', { id: user.id, email: user.email });
      } else {
        console.log('✅ Existing user found:', { id: user.id, email: user.email });
        
        // Update user info if needed
        if (user.name !== payload.name || user.avatar !== payload.picture) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: payload.name || user.name,
              avatar: payload.picture || user.avatar,
            }
          });
          console.log('🔄 User info updated');
        }
      }

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

      // Format user data for frontend
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };

      const response = {
        success: true,
        data: {
          user: userData,
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
    } finally {
      // Close database connection
      await prisma.$disconnect();
    }
  } else {
    console.log('❌ Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
