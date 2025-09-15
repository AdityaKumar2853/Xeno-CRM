const { PrismaClient } = require('@prisma/client');

// Create a singleton Prisma client
let prisma;

if (typeof window === 'undefined') {
  // Only create Prisma client on server side
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'mysql://root:QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS@yamanote.proxy.rlwy.net:23968/railway'
        }
      }
    });
  }
}

export { prisma };

