const mysql = require('mysql2/promise');

// Database configuration
const config = {
  // Local Docker MySQL (source)
  source: {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'password',
    database: 'mini_crm'
  },
  // Railway MySQL (destination)
  destination: {
    host: 'yamanote.proxy.rlwy.net',
    port: 23968,
    user: 'root',
    password: 'QUmiFeNSoJyPtbsaODxZNiqZBxbWalrS',
    database: 'railway'
  }
};

// Define table export order (dependencies first)
const tableOrder = [
  '_prisma_migrations',
  'users',
  'customers',
  'segments',
  'campaigns',
  'orders',
  'segment_customers',
  'communication_logs',
  'ai_integrations',
  'message_queue'
];

async function exportDatabase() {
  console.log('🚀 Starting database export with proper order...');
  
  let sourceConnection, destConnection;
  
  try {
    // Connect to source database (Docker)
    console.log('📡 Connecting to source database (Docker)...');
    sourceConnection = await mysql.createConnection(config.source);
    console.log('✅ Connected to source database');
    
    // Connect to destination database (Railway)
    console.log('📡 Connecting to destination database (Railway)...');
    destConnection = await mysql.createConnection(config.destination);
    console.log('✅ Connected to destination database');
    
    // Disable foreign key checks temporarily
    console.log('🔧 Disabling foreign key checks...');
    await destConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Export tables in correct order
    for (const tableName of tableOrder) {
      console.log(`\n📤 Exporting table: ${tableName}`);
      
      try {
        // Get table structure
        const [createTable] = await sourceConnection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        const createStatement = createTable[0]['Create Table'];
        
        // Create table in destination
        console.log(`  🏗️  Creating table structure...`);
        await destConnection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        await destConnection.execute(createStatement);
        console.log(`  ✅ Table structure created`);
        
        // Get table data
        const [rows] = await sourceConnection.execute(`SELECT * FROM \`${tableName}\``);
        console.log(`  📊 Found ${rows.length} rows`);
        
        if (rows.length > 0) {
          // Get column names
          const [columns] = await sourceConnection.execute(`DESCRIBE \`${tableName}\``);
          const columnNames = columns.map(col => col.Field);
          
          // Insert data in batches
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
            if (batch.length > 0) {
              const placeholders = batch.map(() => `(${columnNames.map(() => '?').join(', ')})`).join(', ');
              const values = batch.flatMap(row => columnNames.map(col => row[col]));
              
              const insertQuery = `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES ${placeholders}`;
              await destConnection.execute(insertQuery, values);
            }
          }
          console.log(`  ✅ Inserted ${rows.length} rows`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error exporting table ${tableName}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    console.log('\n🔧 Re-enabling foreign key checks...');
    await destConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n🎉 Database export completed successfully!');
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    // Close connections
    if (sourceConnection) {
      await sourceConnection.end();
      console.log('📡 Source connection closed');
    }
    if (destConnection) {
      await destConnection.end();
      console.log('📡 Destination connection closed');
    }
  }
}

// Run the export
exportDatabase().catch(console.error);

