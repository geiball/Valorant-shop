const fs = require('fs');

// ---- config ----
const TIER_MAP = {
  '12683d76-48d7-84a3-4e09-6985794f0445': 'select',
  '0cebb8be-46d7-c12a-d306-e9907bfc5a25': 'deluxe',
  '60bca009-4182-7998-dee7-b8a2558dc369': 'premium',
  'e046854e-406c-37f4-6607-19a9ba8426fc': 'exclusive',
  '411e4a55-4e59-7757-41f0-86a53f101bb5': 'ultra',
};

const TIER_ORDER = { select: 0, deluxe: 1, premium: 2, exclusive: 3, ultra: 4 };

const skinsRaw = JSON.parse(fs.readFileSync(__dirname + '/skins.json', 'utf8'));
const weaponsRaw = JSON.parse(fs.readFileSync(__dirname + '/weapons.json', 'utf8'));

// ---- build weapon lookup ----
// Each weapon has a "skins" array with chroma UUIDs; match skin UUID → weapon
const weaponBySkinUuid = {};

for (const w of weaponsRaw.data) {
  for (const s of (w.skins || [])) {
    for (const c of (s.chromas || [])) {
      weaponBySkinUuid[c.uuid] = w.displayName;
    }
    // Also map the skin's own levels
    for (const lvl of (s.levels || [])) {
      weaponBySkinUuid[lvl.uuid] = w.displayName;
    }
    // Direct skin uuid
    weaponBySkinUuid[s.uuid] = w.displayName;
  }
}

// ---- process skins ----
const processed = [];

for (const skin of skinsRaw.data) {
  const tier = TIER_MAP[skin.contentTierUuid];
  if (!tier) continue; // skip battlepass / free tiers

  // Must have display icon (indicates it's a real released skin)
  if (!skin.displayIcon) continue;

  const weapon = weaponBySkinUuid[skin.uuid] || '未知武器';

  // Get the best image: prefer chromas[0].fullRender, fallback to displayIcon
  let imageUrl = skin.displayIcon;
  if (skin.chromas && skin.chromas.length > 0 && skin.chromas[0].fullRender) {
    imageUrl = skin.chromas[0].fullRender;
  }

  processed.push({
    uuid: skin.uuid,
    name: skin.displayName,
    weapon: weapon,
    tier: tier,
    imageUrl: imageUrl,
    themeUuid: skin.themeUuid,
  });
}

console.log(`Total processed skins: ${processed.length}`);

// ---- pick top skins per tier ----
// Group by theme to avoid duplicates (same theme often = similar skins)
const byTier = {};
for (const s of processed) {
  if (!byTier[s.tier]) byTier[s.tier] = [];
  byTier[s.tier].push(s);
}

// Sort each tier by name length desc (longer names = more interesting skins usually)
// Then pick a diverse set covering different weapons
const PICKS_PER_TIER = 5;
const finalPicks = [];

for (const [tier, skins] of Object.entries(byTier)) {
  // Group by weapon for diversity
  const byWeapon = {};
  for (const s of skins) {
    if (!byWeapon[s.weapon]) byWeapon[s.weapon] = [];
    byWeapon[s.weapon].push(s);
  }

  // Pick one skin per weapon, prioritizing skins with longer names
  const candidates = [];
  for (const [weapon, wepSkins] of Object.entries(byWeapon)) {
    wepSkins.sort((a, b) => b.name.length - a.name.length);
    candidates.push(wepSkins[0]);
  }

  // Shuffle and pick PICKS_PER_TIER
  candidates.sort(() => Math.random() - 0.5);
  finalPicks.push(...candidates.slice(0, PICKS_PER_TIER));
}

console.log(`Picked ${finalPicks.length} skins total:\n`);

// Output in db.js seed format
const PRICE_MAP = { select: 875, deluxe: 1275, premium: 1775, exclusive: 2175, ultra: 2475 };

// Assign popularity numbers: ultra > exclusive > premium > deluxe > select
const POP_BASE = { select: 5000, deluxe: 12000, premium: 25000, exclusive: 60000, ultra: 100000 };

// Just use 4 stock images rotating
const IMG_MAP = [
  '/assets/skins/card_opened_1.png',
  '/assets/skins/card_opened_2.png',
  '/assets/skins/card_opened_3.png',
  '/assets/skins/card_opened_4.png',
];

console.log('// ---- Output for db.js ----');
let imgIdx = 0;
for (const s of finalPicks) {
  const img = IMG_MAP[imgIdx % 4];
  imgIdx++;
  const pop = POP_BASE[s.tier] + Math.floor(Math.random() * POP_BASE[s.tier] * 2);
  console.log(`  ['${s.name}', '${s.weapon}', ${PRICE_MAP[s.tier]}, '${s.tier}', ${pop}, '${img}'],`);
}

// Also dump full list for manual review
fs.writeFileSync(
  __dirname + '/all-processed-skins.json',
  JSON.stringify(processed, null, 2),
  'utf8'
);
console.log('\nFull list written to all-processed-skins.json');
