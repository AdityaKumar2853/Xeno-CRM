const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  // Local Docker MySQL (source)
  source: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'xeno_crm'
  },
  // Railway MySQL (destination)
  destination: {
    host: 'containers-us-west-129.railway.app',
    port: 6534,
    user: 'root',
    password: 'your_railway_password_here', // Replace with your actual Railway password
    database: 'railway'
  }
};

async function exportDatabase() {
  console.log('🚀 Starting database export...');
  
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
    
    // Get all tables from source
    console.log('📋 Getting table list...');
    const [tables] = await sourceConnection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // Export each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
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
