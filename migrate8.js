require('dotenv/config');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function run() {
  // Crear columnas si no existen
  await pool.query(`ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS slug TEXT`);
  await pool.query(`ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS preset TEXT DEFAULT 'luxury'`);
  await pool.query(`ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#D4AF37'`);
  console.log('✅ Columnas verificadas');

  const { rows } = await pool.query('SELECT id, nombre FROM proyectos ORDER BY id');
  for (const p of rows) {
    const slug = `${generarSlug(p.nombre)}-${p.id}`;
    await pool.query('UPDATE proyectos SET slug=$1 WHERE id=$2', [slug, p.id]);
    console.log(`  ✅ ID ${p.id}: "${p.nombre}" → ${slug}`);
  }
  console.log('✅ Migrate8 completado');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
