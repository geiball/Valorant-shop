const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './store.db');

// 每次启动删除旧库重新建（开发阶段方便重置数据）
const fs = require('fs');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm');
if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS skins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weapon TEXT NOT NULL,
    price INTEGER NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'select',
    popularity INTEGER DEFAULT 0,
    image_url TEXT NOT NULL
  )
`);

// ---- 从游民星空加载全部国服皮肤数据 ----
const SEED_DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../tool-results/all_skins_seed.json'), 'utf8'));

const insert = db.prepare(
  'INSERT INTO skins (name, weapon, price, rarity, popularity, image_url) VALUES (@name, @weapon, @price, @rarity, @popularity, @image_url)'
);

db.transaction(() => {
  for (const row of SEED_DATA) {
    insert.run(row);
  }
})();

console.log(`Seeded ${SEED_DATA.length} skins.`);

module.exports = db;
