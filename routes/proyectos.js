const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

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

router.post('/', auth, async (req, res) => {
  try {
    const {
      nombre, ubicacion, descripcion, video360, whatsapp, tagline,
      hero_foto, ubicacion_mapa, amenidades, alojamientos, tipo_lugar,
      color_acento, hero_tipo, hero_video, modulos, orden_secciones
    } = req.body;
    const result = await pool.query(
      `INSERT INTO proyectos
        (nombre,ubicacion,descripcion,video360,whatsapp,tagline,hero_foto,
         ubicacion_mapa,amenidades,alojamientos,tipo_lugar,color_acento,
         hero_tipo,hero_video,modulos,orden_secciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [nombre,ubicacion,descripcion,video360,whatsapp,tagline,hero_foto,
       ubicacion_mapa,
       JSON.stringify(amenidades||[]),
       JSON.stringify(alojamientos||[]),
       tipo_lugar||'finca',
       color_acento||'dorado',
       hero_tipo||'imagen',
       hero_video,
       JSON.stringify(modulos||['galeria','amenidades','alojamiento','video360','mapa','contacto']),
       JSON.stringify(orden_secciones||['galeria','amenidades','alojamiento','video360','mapa','contacto'])
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const {
      nombre,ubicacion,descripcion,video360,activo,whatsapp,tagline,
      hero_foto,ubicacion_mapa,amenidades,alojamientos,tipo_lugar,
      color_acento,hero_tipo,hero_video,modulos,orden_secciones
    } = req.body;
    const result = await pool.query(
      `UPDATE proyectos SET
        nombre=$1,ubicacion=$2,descripcion=$3,video360=$4,activo=$5,
        whatsapp=$6,tagline=$7,hero_foto=$8,ubicacion_mapa=$9,
        amenidades=$10,alojamientos=$11,tipo_lugar=$12,
        color_acento=$13,hero_tipo=$14,hero_video=$15,
        modulos=$16,orden_secciones=$17
       WHERE id=$18 RETURNING *`,
      [nombre,ubicacion,descripcion,video360,activo,
       whatsapp,tagline,hero_foto,ubicacion_mapa,
       JSON.stringify(amenidades||[]),
       JSON.stringify(alojamientos||[]),
       tipo_lugar||'finca',
       color_acento||'dorado',
       hero_tipo||'imagen',
       hero_video,
       JSON.stringify(modulos||['galeria','amenidades','alojamiento','video360','mapa','contacto']),
       JSON.stringify(orden_secciones||['galeria','amenidades','alojamiento','video360','mapa','contacto']),
       req.params.id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
