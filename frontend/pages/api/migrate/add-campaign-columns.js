import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('🔧 Adding missing columns to campaigns table...');
    
    // Add sentCount column
    await prisma.$executeRaw`ALTER TABLE campaigns ADD COLUMN sentCount INT NOT NULL DEFAULT 0`;
    console.log('✅ Added sentCount column');
    
    // Add openRate column  
    await prisma.$executeRaw`ALTER TABLE campaigns ADD COLUMN openRate FLOAT NOT NULL DEFAULT 0`;
    console.log('✅ Added openRate column');
    
    res.status(200).json({
      success: true,
      message: 'Successfully added missing columns to campaigns table',
      columns: ['sentCount', 'openRate']
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    
    // Check if columns already exist
    if (error.message.includes('Duplicate column name')) {
      res.status(200).json({
        success: true,
        message: 'Columns already exist in campaigns table',
        columns: ['sentCount', 'openRate']
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Migration failed: ' + error.message
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}
