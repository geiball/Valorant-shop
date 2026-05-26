const fs = require('fs');

const TIER_MAP = {
  '12683d76-48d7-84a3-4e09-6985794f0445': 'select',
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'deluxe',
  '60bca009-4182-7998-dee7-b8a2558dc369': 'premium',
  'e046854e-406c-37f4-6607-19a9ba8426fc': 'exclusive',
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 'ultra',
};

const PRICE_MAP = { select: 875, deluxe: 1275, premium: 1775, exclusive: 2175, ultra: 2475 };
const POP_BASE = { select: 5000, deluxe: 15000, premium: 30000, exclusive: 80000, ultra: 150000 };

const IMG_MAP = [
  '/assets/skins/card_opened_1.png',
  '/assets/skins/card_opened_2.png',
  '/assets/skins/card_opened_3.png',
  '/assets/skins/card_opened_4.png',
];

const skinsRaw = JSON.parse(fs.readFileSync(__dirname + '/skins.json', 'utf8'));
const weaponsRaw = JSON.parse(fs.readFileSync(__dirname + '/weapons.json', 'utf8'));

// Build weapon lookup from weapons.json
const weaponBySkinUuid = {};
for (const w of weaponsRaw.data) {
  for (const s of (w.skins || [])) {
    weaponBySkinUuid[s.uuid] = w.displayName;
    for (const lvl of (s.levels || [])) {
      weaponBySkinUuid[lvl.uuid] = w.displayName;
    }
    for (const c of (s.chromas || [])) {
      weaponBySkinUuid[c.uuid] = w.displayName;
    }
  }
}

// Process all skins
const all = [];
for (const skin of skinsRaw.data) {
  const tier = TIER_MAP[skin.contentTierUuid];
  if (!tier) continue;
  if (!skin.displayIcon) continue;

  const weapon = weaponBySkinUuid[skin.uuid] || '未知武器';

  all.push({
    name: skin.displayName,
    weapon,
    tier,
    price: PRICE_MAP[tier],
    uuid: skin.uuid,
  });
}

// ---- hand-pick iconic skins per tier with weapon diversity ----

// Helper: pick from tier, prefer iconic names, ensure different weapons
function pickTier(tier, wantedWeapons, iconicKeywords) {
  const tierSkins = all.filter(s => s.tier === tier);
  const picks = [];
  const usedWeapons = new Set();

  // First pass: try to match iconic keywords + wanted weapons
  for (const kw of iconicKeywords) {
    for (const skin of tierSkins) {
      if (skin.name.includes(kw) && !usedWeapons.has(skin.weapon) && picks.length < 5) {
        picks.push(skin);
        usedWeapons.add(skin.weapon);
        break;
      }
    }
  }

  // Second pass: fill remaining slots with any skin from wanted weapons
  for (const wep of wantedWeapons) {
    if (picks.length >= 5) break;
    if (usedWeapons.has(wep)) continue;
    const match = tierSkins.find(s => s.weapon === wep && !picks.includes(s));
    if (match) {
      picks.push(match);
      usedWeapons.add(wep);
    }
  }

  // Third pass: any remaining slots
  for (const skin of tierSkins) {
    if (picks.length >= 5) break;
    if (!usedWeapons.has(skin.weapon)) {
      picks.push(skin);
      usedWeapons.add(skin.weapon);
    }
  }

  return picks.slice(0, 5);
}

const MAIN_WEAPONS = ['狂徒', '幻影', '冥驹', '判官', '鬼魅', '獠犬', '正义', '战神'];

const picks = [
  // SELECT (精选) - affordable skins, fun themes
  ...pickTier('select', MAIN_WEAPONS, ['异彩晶棱', '极速狂飙', '流星雨', '棱镜', '粉碎者', '冬日幻境']),

  // DELUXE (豪华) - mid-tier
  ...pickTier('deluxe', MAIN_WEAPONS, ['深海猎手', '冬日幻境', '樱华', '帝王', '水族馆', 'MK.VII', '极简主义']),

  // PREMIUM (高级) - iconic premium lines
  ...pickTier('premium', MAIN_WEAPONS, ['盖世英雄', '离子', '掠夺', '盖亚', '海洋之星', '掠影', '奇幻朋克', '起源']),

  // EXCLUSIVE (独占) - top tier non-ultra
  ...pickTier('exclusive', MAIN_WEAPONS, ['混沌序曲', '奇点', 'RGX', '光明哨兵', '千灵华绽', '至尊龙炎', '异星霸主', '虚无', '等离子']),

  // ULTRA (终极) - best of the best (only 23 exist)
  ...pickTier('ultra', MAIN_WEAPONS, ['上古龙炎', '781-A', '艾沃莉', '源能者', '超时空卫队', 'ORA']),
];

// Generate popularity
let imgIdx = 0;
for (const s of picks) {
  const img = IMG_MAP[imgIdx % 4];
  imgIdx++;
  s.image_url = img;
  s.popularity = POP_BASE[s.tier] + Math.floor(Math.random() * POP_BASE[s.tier] * 1.5);
}

console.log(JSON.stringify(picks, null, 2));
console.log('\n// ---- db.js SEED_DATA format ----');
for (const s of picks) {
  console.log(`  ['${s.name}', '${s.weapon}', ${s.price}, '${s.tier}', ${s.popularity}, '${s.image_url}'],`);
}
console.log(`\nTotal: ${picks.length} skins`);
