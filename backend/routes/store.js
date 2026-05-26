const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM skins ORDER BY RAND() LIMIT 4'
    );
    res.json({ skins: rows });
  } catch (err) {
    console.error('Failed to fetch random skins:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
