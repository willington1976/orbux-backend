const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// ─── HELPER: generar slug desde nombre ───────────────────────
function generarSlug(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─── GET todos los proyectos (público) ───────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
        json_agg(f.* ORDER BY f.orden) FILTER (WHERE f.id IS NOT NULL) as fotos
      FROM proyectos p
      LEFT JOIN fotos f ON f.proyecto_id = p.id
      WHERE p.activo = true
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET por slug (público) — /api/proyectos/slug/hotel-luna-roja
router.get('/slug/:slug', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
        json_agg(f.* ORDER BY f.orden) FILTER (WHERE f.id IS NOT NULL) as fotos
      FROM proyectos p
      LEFT JOIN fotos f ON f.proyecto_id = p.id
      WHERE p.slug = $1 AND p.activo = true
      GROUP BY p.id
    `, [req.params.slug]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST crear proyecto ──────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const {
      nombre, ubicacion, descripcion, video360, whatsapp, tagline,
      hero_foto, ubicacion_mapa, amenidades, alojamientos, tipo_lugar,
      color_acento, hero_tipo, hero_video, modulos, orden_secciones, stats,
      preset, color_hex,
    } = req.body;

    const slugBase = generarSlug(nombre || 'proyecto');

    const result = await pool.query(
      `INSERT INTO proyectos
        (nombre,ubicacion,descripcion,video360,whatsapp,tagline,hero_foto,
         ubicacion_mapa,amenidades,alojamientos,tipo_lugar,color_acento,
         hero_tipo,hero_video,modulos,orden_secciones,stats,preset,color_hex)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [
        nombre, ubicacion, descripcion, video360, whatsapp, tagline, hero_foto,
        ubicacion_mapa,
        JSON.stringify(amenidades    || []),
        JSON.stringify(alojamientos  || []),
        tipo_lugar    || 'finca',
        color_acento  || 'dorado',
        hero_tipo     || 'imagen',
        hero_video,
        JSON.stringify(modulos       || ['galeria','amenidades','alojamiento','video360','mapa','contacto']),
        JSON.stringify(orden_secciones || ['galeria','amenidades','alojamiento','video360','mapa','contacto']),
        JSON.stringify(stats         || []),
        preset    || 'luxury',
        color_hex || '#D4AF37',
      ]
    );

    const proyecto = result.rows[0];
    const slugFinal = `${slugBase}-${proyecto.id}`;
    await pool.query('UPDATE proyectos SET slug=$1 WHERE id=$2', [slugFinal, proyecto.id]);
    proyecto.slug = slugFinal;

    res.json(proyecto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT actualizar proyecto ──────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      nombre, ubicacion, descripcion, video360, activo, whatsapp, tagline,
      hero_foto, ubicacion_mapa, amenidades, alojamientos, tipo_lugar,
      color_acento, hero_tipo, hero_video, modulos, orden_secciones, stats,
      preset, color_hex,
    } = req.body;

    const slugBase  = generarSlug(nombre || 'proyecto');
    const slugFinal = `${slugBase}-${req.params.id}`;

    const result = await pool.query(
      `UPDATE proyectos SET
        nombre=$1, ubicacion=$2, descripcion=$3, video360=$4, activo=$5,
        whatsapp=$6, tagline=$7, hero_foto=$8, ubicacion_mapa=$9,
        amenidades=$10, alojamientos=$11, tipo_lugar=$12,
        color_acento=$13, hero_tipo=$14, hero_video=$15,
        modulos=$16, orden_secciones=$17, stats=$18, slug=$19,
        preset=$20, color_hex=$21
       WHERE id=$22 RETURNING *`,
      [
        nombre, ubicacion, descripcion, video360, activo,
        whatsapp, tagline, hero_foto, ubicacion_mapa,
        JSON.stringify(amenidades    || []),
        JSON.stringify(alojamientos  || []),
        tipo_lugar    || 'finca',
        color_acento  || 'dorado',
        hero_tipo     || 'imagen',
        hero_video,
        JSON.stringify(modulos       || ['galeria','amenidades','alojamiento','video360','mapa','contacto']),
        JSON.stringify(orden_secciones || ['galeria','amenidades','alojamiento','video360','mapa','contacto']),
        JSON.stringify(stats         || []),
        slugFinal,
        preset    || 'luxury',
        color_hex || '#D4AF37',
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE proyecto ─────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
