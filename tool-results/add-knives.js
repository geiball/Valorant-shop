const https = require('https');
const fs = require('fs');
const path = require('path');

// ---- Fetch knife skins from API ----
function fetchPage(pageIndex) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      pageIndex, pageSize: 100,
      weaponName: '近战', skinRarity: [], skinSort: 0, keyword: '',
      RegionName: 'ChianMainland'
    });
    const options = {
      hostname: 'router4.gamersky.com',
      path: '/@valorant/Skin/GetSkinList',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.gamersky.com/'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ---- Download image ----
function download(url, filepath) {
  return new Promise((resolve) => {
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 100) {
      resolve(true);
      return;
    }
    const req = https.get(url, { headers: { Referer: 'https://www.gamersky.com/' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filepath).then(resolve);
        return;
      }
      if (res.statusCode !== 200) { resolve(false); return; }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
  });
}

// RARITY_MAP from gamersky rarity to our db rarity
const RARITY_MAP = {
  1: 'select',
  2: 'deluxe',
  3: 'premium',
  5: 'exclusive',
  4: 'ultra',
};

const TARGET_DIR = path.resolve(__dirname, '../../frontend/public/assets/skins');

(async () => {
  // Fetch all knife skins
  const allKnives = [];
  for (let i = 1; i <= 3; i++) {
    const result = await fetchPage(i);
    allKnives.push(...result.skinList);
    console.log(`Page ${i}: ${result.skinList.length} knives, total: ${allKnives.length}`);
    if (result.skinList.length < 100) break;
  }

  // Filter to priced knives only
  const priced = allKnives.filter(s => (s.priceInChianMainland || s.price) > 0);
  console.log(`\nKnives with price: ${priced.length}`);

  // Read existing seed data to get current max index
  const seedPath = __dirname + '/all_skins_seed.json';
  const existing = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  let imgIdx = existing.length; // start after existing gun skins

  const newKnives = [];
  const downloads = [];

  for (const k of priced) {
    imgIdx++;
    const price = Math.round(k.priceInChianMainland || k.price);
    const rarity = RARITY_MAP[k.skinRarity] || 'exclusive';
    const localFile = `skin_${imgIdx}.png`;

    newKnives.push({
      name: k.name_SC,
      weapon: '近战',
      price: price,
      rarity: rarity,
      popularity: k.ownersCount || 1000,
      image_url: `/assets/skins/${localFile}`
    });

    downloads.push({ url: k.picUrl, file: path.join(TARGET_DIR, localFile) });
  }

  console.log(`\nDownloading ${downloads.length} knife images...`);
  let completed = 0, failed = 0;
  const concurrency = 10;
  const queue = [...downloads];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      const ok = await download(item.url, item.file);
      completed++;
      if (!ok) failed++;
      if (completed % 20 === 0 || completed === downloads.length) {
        console.log(`  ${completed}/${downloads.length} (${failed} failed)`);
      }
    }
  }

  const workers = Array(Math.min(concurrency, queue.length)).fill().map(() => worker());
  await Promise.all(workers);
  console.log(`Done: ${completed - failed} ok, ${failed} failed`);

  // Merge into seed data
  const merged = [...existing, ...newKnives];
  fs.writeFileSync(seedPath, JSON.stringify(merged, null, 2));
  console.log(`\nMerged into all_skins_seed.json: ${existing.length} guns + ${newKnives.length} knives = ${merged.length} total`);

  // Show knife summary
  console.log('\nAdded knives:');
  for (const k of newKnives.slice(0, 10)) {
    console.log(`  ${k.name} | ${k.price}VP | ${k.popularity} owners`);
  }
  console.log(`  ... and ${newKnives.length - 10} more`);
})();
