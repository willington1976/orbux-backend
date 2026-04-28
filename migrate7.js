require('dotenv').config();
const pool = require('./db');

// ─── MAPA DE CONVERSIÓN — colores viejos a hex ───────────────
const COLOR_MAP = {
  dorado:    '#D4AF37',
  azul:      '#0056b3',
  verde:     '#2D452F',
  coral:     '#C0392B',
  gris:      '#6B7280',
  bordo:     '#7B1A36',
  cobre:     '#B87333',
  turquesa:  '#0E9090',
  champagne: '#C8A97E',
  lavanda:   '#7B68B5',
  titanio:   '#8A8A8E',
  esmeralda: '#1A7A4A',
};

// ─── MAPA DE PRESET por defecto según color ──────────────────
const PRESET_MAP = {
  dorado:    'luxury',
  azul:      'corporate',
  verde:     'eco',
  coral:     'luxury',
  gris:      'corporate',
  bordo:     'luxury',
  cobre:     'luxury',
  turquesa:  'tech',
  champagne: 'eco',
  lavanda:   'eco',
  titanio:   'corporate',
  esmeralda: 'eco',
};

async function migrar() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Agregar columnas nuevas
    await client.query(`
      ALTER TABLE proyectos
        ADD COLUMN IF NOT EXISTS preset      VARCHAR(20)  DEFAULT 'luxury',
        ADD COLUMN IF NOT EXISTS color_hex   VARCHAR(7)   DEFAULT '#D4AF37';
    `);
    console.log('✅ Columnas preset y color_hex agregadas');

    // 2. Convertir proyectos existentes
    const { rows } = await client.query(
      'SELECT id, color_acento FROM proyectos'
    );

    for (const p of rows) {
      const viejo  = (p.color_acento || 'dorado').toLowerCase().trim();
      const hex    = COLOR_MAP[viejo]    || '#D4AF37';
      const preset = PRESET_MAP[viejo]   || 'luxury';

      await client.query(
        'UPDATE proyectos SET color_hex=$1, preset=$2 WHERE id=$3',
        [hex, preset, p.id]
      );
      console.log(`  ✅ ID ${p.id}: "${viejo}" → hex:${hex} preset:${preset}`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Migración 7 completada');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error — rollback ejecutado:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

migrar();
