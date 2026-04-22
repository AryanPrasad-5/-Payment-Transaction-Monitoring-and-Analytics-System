const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({ connectionString: 'postgres://postgres:postgres@127.0.0.1:5432/postgres' });
  try {
    await client.connect();
    const sql = fs.readFileSync('c:/Users/HP/Desktop/OJT-sem-2/rust-processor/migrations/03_auth_schema.sql').toString();
    await client.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit();
  }
}
run();
