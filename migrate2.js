require('dotenv').config();
const pool = require('./db');

async function migrar() {
  try {
    await pool.query(`
      ALTER TABLE proyectos
        ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
        ADD COLUMN IF NOT EXISTS tagline VARCHAR(255),
        ADD COLUMN IF NOT EXISTS hero_foto VARCHAR(500),
        ADD COLUMN IF NOT EXISTS ubicacion_mapa VARCHAR(255),
        ADD COLUMN IF NOT EXISTS amenidades JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS alojamientos JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS tipo_lugar VARCHAR(50) DEFAULT 'finca';
    `);
    console.log('✅ Columnas agregadas correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrar();
