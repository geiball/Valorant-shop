const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, process.env.DB_PATH || './store.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS skins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weapon TEXT NOT NULL,
    price INTEGER NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    popularity INTEGER DEFAULT 0,
    image_url TEXT NOT NULL
  )
`);

const count = db.prepare('SELECT COUNT(*) as cnt FROM skins').get();
if (count.cnt === 0) {
  const insert = db.prepare(
    'INSERT INTO skins (name, weapon, price, rarity, popularity, image_url) VALUES (?, ?, ?, ?, ?, ?)'
  );
  db.transaction(() => {
    insert.run('异彩晶棱 幻影', '幻影', 890, 'rare', 26000, '/assets/skins/card_opened_1.png');
    insert.run('盖世英雄 鬼魅', '鬼魅', 1290, 'epic', 146000, '/assets/skins/card_opened_2.png');
    insert.run('无人之境 狂徒', '狂徒', 1290, 'epic', 34000, '/assets/skins/card_opened_3.png');
    insert.run('无人之境 鬼魅', '鬼魅', 1290, 'epic', 16000, '/assets/skins/card_opened_4.png');
  })();
  console.log('Seed data inserted.');
}

module.exports = db;
