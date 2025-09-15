const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration
const config = {
  // Local Docker MySQL (source)
  source: {
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'password',
    database: 'mini_crm'
  }
};

async function dumpDatabase() {
  console.log('🚀 Starting database dump...');
  
  let connection;
  
  try {
    // Connect to source database (Docker)
    console.log('📡 Connecting to source database (Docker)...');
    connection = await mysql.createConnection(config.source);
    console.log('✅ Connected to source database');
    
    // Get all tables
    console.log('📋 Getting table list...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    // Create dump directory
    const dumpDir = './database-dump';
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir);
    }
    
    // Dump each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📤 Dumping table: ${tableName}`);
      
      try {
        // Get table structure
        const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        const createStatement = createTable[0]['Create Table'];
        
        // Get table data
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
        console.log(`  📊 Found ${rows.length} rows`);
        
        // Create SQL file for this table
        const sqlFile = `${dumpDir}/${tableName}.sql`;
        let sqlContent = `-- Table structure for ${tableName}\n`;
        sqlContent += `${createStatement};\n\n`;
        
        if (rows.length > 0) {
          // Get column names
          const [columns] = await connection.execute(`DESCRIBE \`${tableName}\``);
          const columnNames = columns.map(col => col.Field);
          
          sqlContent += `-- Data for ${tableName}\n`;
          sqlContent += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES\n`;
          
          // Add data rows
          const dataRows = rows.map(row => {
            const values = columnNames.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            return `(${values.join(', ')})`;
          });
          
          sqlContent += dataRows.join(',\n') + ';\n';
        }
        
        // Write to file
        fs.writeFileSync(sqlFile, sqlContent);
        console.log(`  ✅ Dumped to ${sqlFile}`);
        
      } catch (error) {
        console.error(`  ❌ Error dumping table ${tableName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database dump completed successfully!');
    console.log(`📁 Files saved in: ${dumpDir}/`);
    
  } catch (error) {
    console.error('❌ Dump failed:', error);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('📡 Source connection closed');
    }
  }
}

// Run the dump
dumpDatabase().catch(console.error);

