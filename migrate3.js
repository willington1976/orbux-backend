require('dotenv').config();
const pool = require('./db');

async function migrar() {
  try {
    await pool.query(`
      ALTER TABLE proyectos
        ADD COLUMN IF NOT EXISTS color_acento VARCHAR(20) DEFAULT 'dorado',
        ADD COLUMN IF NOT EXISTS hero_tipo VARCHAR(20) DEFAULT 'imagen',
        ADD COLUMN IF NOT EXISTS hero_video VARCHAR(500),
        ADD COLUMN IF NOT EXISTS modulos JSONB DEFAULT '["galeria","amenidades","alojamiento","video360","mapa","contacto"]',
        ADD COLUMN IF NOT EXISTS orden_secciones JSONB DEFAULT '["galeria","amenidades","alojamiento","video360","mapa","contacto"]';
    `);
    console.log('✅ Columnas modulares agregadas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

migrar();
