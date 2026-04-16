const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// GET todos los proyectos (público)
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

// POST crear proyecto (requiere auth)
router.post('/', auth, async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, video360 } = req.body;
    const result = await pool.query(
      'INSERT INTO proyectos (nombre, ubicacion, descripcion, video360) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, ubicacion, descripcion, video360]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar proyecto (requiere auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const { nombre, ubicacion, descripcion, video360, activo } = req.body;
    const result = await pool.query(
      'UPDATE proyectos SET nombre=$1, ubicacion=$2, descripcion=$3, video360=$4, activo=$5 WHERE id=$6 RETURNING *',
      [nombre, ubicacion, descripcion, video360, activo, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE proyecto (requiere auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM proyectos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
