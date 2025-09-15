const mysql = require('mysql2/promise');

// Railway MySQL configuration
const config = {
  host: 'yamanote.proxy.rlwy.net',
  port: 23968,
  user: 'root',
  password: 'QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS',
  database: 'railway'
};

async function verifyData() {
  console.log('🔍 Verifying Railway database data...');
  
  let connection;
  
  try {
    // Connect to Railway database
    console.log('📡 Connecting to Railway database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to Railway database');
    
    // Check each table
    const tables = ['users', 'customers', 'orders', 'segments', 'campaigns'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
        const count = rows[0].count;
        console.log(`📊 ${table}: ${count} rows`);
        
        // Show sample data for main tables
        if (table === 'customers' && count > 0) {
          const [sampleRows] = await connection.execute(`SELECT id, name, email, totalSpent FROM \`${table}\` LIMIT 3`);
          console.log(`   Sample customers:`, sampleRows);
        }
        
        if (table === 'orders' && count > 0) {
          const [sampleRows] = await connection.execute(`SELECT id, orderNumber, totalAmount, status FROM \`${table}\` LIMIT 3`);
          console.log(`   Sample orders:`, sampleRows);
        }
        
      } catch (error) {
        console.error(`❌ Error checking ${table}:`, error.message);
      }
    }
    
    console.log('\n✅ Railway database verification completed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Railway connection closed');
    }
  }
}

// Run verification
verifyData().catch(console.error);

