import { PrismaClient } from '@prisma/client';

// Create Prisma client with Railway database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://root:QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS@yamanote.proxy.rlwy.net:23968/railway'
    }
  }
});

export default async function handler(req, res) {
  console.log('🔍 Token verification API called:', {
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided' },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      // Decode the simple JWT token
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check if token is expired
      if (payload.exp && Date.now() > payload.exp) {
        console.log('❌ Token expired');
        return res.status(401).json({
          success: false,
          error: { message: 'Token expired' },
        });
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        console.log('❌ User not found in database');
        return res.status(401).json({
          success: false,
          error: { message: 'User not found' },
        });
      }

      console.log('✅ Token verified successfully:', { userId: user.id, email: user.email });

      // Format user data for frontend
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };

      res.status(200).json({
        success: true,
        data: {
          user: userData,
          valid: true,
        },
      });

    } catch (error) {
      console.error('❌ Token verification error:', error);
      res.status(401).json({
        success: false,
        error: { message: 'Invalid token' },
      });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.log('❌ Method not allowed:', req.method);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}