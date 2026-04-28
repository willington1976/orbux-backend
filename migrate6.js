require('dotenv').config();
const pool = require('./db');

async function migrar() {
  try {
    await pool.query(`
      ALTER TABLE proyectos
        ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
    `);

    // Generar slugs para proyectos existentes
    const { rows } = await pool.query('SELECT id, nombre FROM proyectos WHERE slug IS NULL');
    for (const p of rows) {
      const slug = generarSlug(p.nombre) + '-' + p.id;
      await pool.query('UPDATE proyectos SET slug=$1 WHERE id=$2', [slug, p.id]);
      console.log(`✅ ${p.nombre} → ${slug}`);
    }

    console.log('✅ Columna slug agregada y poblada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina tildes
    .replace(/[^a-z0-9\s-]/g, '')    // solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-');           // espacios → guiones
}

migrar();
