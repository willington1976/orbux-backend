const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// POST guardar mensaje (público)
router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, tipo_propiedad, servicio, mensaje } = req.body;
    await pool.query(
      'INSERT INTO contactos (nombre, contacto, tipo_propiedad, servicio, mensaje) VALUES ($1,$2,$3,$4,$5)',
      [nombre, contacto, tipo_propiedad, servicio, mensaje]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ver mensajes (requiere auth)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contactos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT marcar como leído (requiere auth)
router.put('/:id/leido', auth, async (req, res) => {
  try {
    await pool.query('UPDATE contactos SET leido=true WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
