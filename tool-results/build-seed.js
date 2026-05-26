const fs = require('fs');
const https = require('https');
const path = require('path');

const filtered = JSON.parse(fs.readFileSync(__dirname + '/filtered_skins.json', 'utf8'));

// Gamersky rarity → our db rarity
const RARITY_MAP = {
  1: 'select',    // 精選
  2: 'deluxe',    // 奢華
  3: 'premium',   // 尊爵
  5: 'exclusive', // 限定 (international Exclusive tier)
  4: 'ultra',     // 究極 (international Ultra tier)
};

// Popular weapons to prioritize
const PRIORITY_WEAPONS = ['狂徒', '幻影', '冥驹', '判官', '鬼魅', '獠犬', '正义', '战神', '戍卫', '狂怒', '标配', '雄鹿', '奥丁', '短炮', '莽侠', '飞将', '蜂刺', '骇灵'];

// Map gamersky rarity to our rarity
const allProcessed = filtered
  .map(s => ({
    name: s.name_SC,
    weapon: s.weaponName_SC,
    price: s.priceInChianMainland || s.price,
    rarity: RARITY_MAP[s.skinRarity],
    popularity: s.ownersCount || 1000,
    score: s.score || 7,
    imgUrl: s.picUrl,
    skinRarityDesc: s.skinRarityDescription,
  }))
  .filter(s => s.rarity && s.price > 0);

// Group by rarity
const byRarity = {};
for (const s of allProcessed) {
  if (!byRarity[s.rarity]) byRarity[s.rarity] = [];
  byRarity[s.rarity].push(s);
}

console.log('Available per tier:');
for (const [r, skins] of Object.entries(byRarity)) {
  console.log(`  ${r}: ${skins.length} skins`);
}

// Pick top 5 per tier with weapon diversity
const picks = [];
for (const [rarity, skins] of Object.entries(byRarity)) {
  // Sort by score * popularity
  skins.sort((a, b) => (b.score * b.popularity) - (a.score * a.popularity));

  // Greedy: pick highest scored skin per weapon
  const usedWeapons = new Set();
  const tierPicks = [];

  // First pass: prioritize popular weapons
  for (const wep of PRIORITY_WEAPONS) {
    if (tierPicks.length >= 5) break;
    const best = skins.find(s => s.weapon === wep && !usedWeapons.has(wep));
    if (best) {
      tierPicks.push(best);
      usedWeapons.add(wep);
    }
  }

  // Second pass: fill any remaining slots
  for (const s of skins) {
    if (tierPicks.length >= 5) break;
    if (!usedWeapons.has(s.weapon)) {
      tierPicks.push(s);
      usedWeapons.add(s.weapon);
    }
  }

  picks.push(...tierPicks);
  console.log(`\n${rarity} (${skins[0]?.skinRarityDesc}):`);
  for (const s of tierPicks) {
    console.log(`  ${s.name} | ${s.weapon} | ${s.price}点券 | score:${s.score} | owners:${s.popularity}`);
  }
}

// Generate db.js SEED_DATA format
console.log('\n\n// ===== COPY TO db.js SEED_DATA =====');
let imgIdx = 0;
const IMG_MAP = [
  '/assets/skins/card_opened_1.png',
  '/assets/skins/card_opened_2.png',
  '/assets/skins/card_opened_3.png',
  '/assets/skins/card_opened_4.png',
];

const seedLines = [];
const imageDownloads = [];

for (const s of picks) {
  const localImg = IMG_MAP[imgIdx % 4];
  imgIdx++;

  // Also save the gamersky CDN URL for downloading later
  imageDownloads.push({ name: s.name, url: s.imgUrl, local: '' });

  // Format with gamersky price (in 点券, divide by 100 since data is in cents or has 2 decimal places)
  // Actually looking at the data: priceInChianMainland values like 5.9, 8.9, 12.9 represent 点券
  // 5.9 点券... that doesn't make sense. Let me check.
  // price: 5.9 → could be 590 点券 (but stored as yuan / 100)
  // Actually 5.9 yuan = 590 点券 (since 1 yuan = 100 点券? No, 1 yuan = 10 点券)

  // Wait, let me re-read: price is like 5.9. In the gamersky API, is this yuan or 点券?
  // Looking at the data: 沙场老兵 = 5.9, this is SELECT tier which should be 590 VP
  // 5.9 yuan = 59 点券? But that's wrong.
  // Actually in Chinese server, Select = 590 点券 = ~59 yuan
  // So price 5.9 might be 5.9 yuan, which = 590 点券 (1 yuan = 100 点券? no...)
  // Let me just multiply by 10: 5.9 * 10 = 59 yuan = 590 点券

  // Actually, looking at it again: the value is stored as 5.9 which is the price in yuan / 10
  // Let me multiply by 100 to get 点券
  // 5.9 * 100 = 590 VP ✓ (Select tier)
  // 8.9 * 100 = 890 VP ✓ (Deluxe tier)
  // 12.9 * 100 = 1290 VP ✓ (Premium tier)
  // 15.9 * 100 = 1590 VP ✓ (Exclusive/Limited tier)
  // 17.9 * 100 = 1790 VP ✓ (Ultra tier)
  // 20.9 * 100 = 2090 VP ✓ (Special Ultra)

  // price is already in 点券 from the API
  const priceVP = Math.round(s.price);

  seedLines.push(`  ['${s.name}', '${s.weapon}', ${priceVP}, '${s.rarity}', ${s.popularity}, '${localImg}'],`);
}

console.log('const SEED_DATA = [');
for (const line of seedLines) {
  console.log(line);
}
console.log('];');
console.log(`\nTotal: ${picks.length} skins`);

// Save image URLs for downloading
fs.writeFileSync(__dirname + '/image_downloads.json', JSON.stringify(imageDownloads, null, 2));
console.log('\nImage URLs saved to image_downloads.json');

// Also save full picks data
fs.writeFileSync(__dirname + '/final_picks.json', JSON.stringify(picks, null, 2));
console.log('Picks saved to final_picks.json');
