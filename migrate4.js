require('dotenv').config();
const pool = require('./db');

async function migrar() {
  try {
    await pool.query(`
      ALTER TABLE fotos
        ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'general';
    `);
    console.log('✅ Columna categoria agregada a fotos');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrar();
