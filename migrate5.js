require('dotenv').config();
const pool = require('./db');

async function migrar() {
  try {
    await pool.query(`
      ALTER TABLE proyectos
        ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[]';
    `);
    console.log('✅ Columna stats agregada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrar();
