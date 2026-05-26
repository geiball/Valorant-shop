const https = require('https');
const fs = require('fs');
const path = require('path');

const picks = JSON.parse(fs.readFileSync(__dirname + '/final_picks.json', 'utf8'));

const IMG_MAP = [
  '/assets/skins/card_opened_1.png',
  '/assets/skins/card_opened_2.png',
  '/assets/skins/card_opened_3.png',
  '/assets/skins/card_opened_4.png',
];

const targetDir = path.resolve(__dirname, '../../frontend/public/assets/skins');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        console.log(`  SKIP (${res.statusCode}): ${path.basename(filepath)}`);
        resolve(false);
        return;
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(filepath).size;
        console.log(`  OK (${(size/1024).toFixed(1)}KB): ${path.basename(filepath)}`);
        resolve(true);
      });
    }).on('error', (e) => {
      console.log(`  FAIL: ${path.basename(filepath)} - ${e.message}`);
      resolve(false);
    });
  });
}

(async () => {
  let imgIdx = 0;
  console.log(`Downloading ${picks.length} skin images to ${targetDir}...\n`);

  for (const skin of picks) {
    const localImg = IMG_MAP[imgIdx % 4];
    imgIdx++;

    // The images on gamersky CDN are the actual skin renders
    // We'll download them and use them as the card images
    const ext = path.extname(new URL(skin.imgUrl).pathname) || '.png';
    const filename = `${skin.rarity}_${skin.weapon}_${skin.name.replace(/[/\\?%*:|"<>]/g, '')}${ext}`;
    // Actually, just use a simple naming scheme
    const simpleName = `${skin.rarity}_${imgIdx}${ext}`;
    const filepath = path.join(targetDir, simpleName);

    console.log(`${skin.name} (${skin.rarity})`);
    console.log(`  from: ${skin.imgUrl}`);
    await download(skin.imgUrl, filepath);
  }

  console.log('\nDone!');
})();
