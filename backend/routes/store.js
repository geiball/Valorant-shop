const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/random', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM skins ORDER BY RANDOM() LIMIT 4').all();
    res.json({ skins: rows });
  } catch (err) {
    console.error('Failed to fetch random skins:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
