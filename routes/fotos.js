const router = require('express').Router();
const cloudinary = require('cloudinary').v2;
const pool = require('../db');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST subir foto con categoria opcional
router.post('/subir/:proyecto_id', auth, async (req, res) => {
  try {
    if (!req.files?.foto) return res.status(400).json({ error: 'No se envió foto' });
    const file = req.files.foto;
    const categoria = req.body.categoria || 'general';
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `orbux/proyecto-${req.params.proyecto_id}`,
      transformation: [{ width: 1920, crop: 'limit', quality: 'auto' }]
    });
    const foto = await pool.query(
      'INSERT INTO fotos (proyecto_id, url, public_id, categoria) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.proyecto_id, result.secure_url, result.public_id, categoria]
    );
    res.json(foto.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar categoria de foto
router.put('/:id/categoria', auth, async (req, res) => {
  try {
    const { categoria } = req.body;
    const result = await pool.query(
      'UPDATE fotos SET categoria=$1 WHERE id=$2 RETURNING *',
      [categoria, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar foto
router.delete('/:id', auth, async (req, res) => {
  try {
    const foto = await pool.query('SELECT * FROM fotos WHERE id=$1', [req.params.id]);
    if (foto.rows.length === 0) return res.status(404).json({ error: 'Foto no encontrada' });
    await cloudinary.uploader.destroy(foto.rows[0].public_id);
    await pool.query('DELETE FROM fotos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
