const https = require('https');
const fs = require('fs');
const path = require('path');

const skins = JSON.parse(fs.readFileSync(__dirname + '/all_skins_seed.json', 'utf8'));
const TARGET = path.resolve(__dirname, '../../frontend/public/assets/skins');

if (!fs.existsSync(TARGET)) fs.mkdirSync(TARGET, { recursive: true });

// Build unique image list with local filenames
let idx = 0;
const downloads = [];
for (const s of skins) {
  idx++;
  const ext = '.png';
  const localFile = `skin_${idx}${ext}`;
  s._localFile = localFile;
  s._localPath = `/assets/skins/${localFile}`;
  downloads.push({ url: s.image_url, file: path.join(TARGET, localFile) });
}

console.log(`Downloading ${downloads.length} images...\n`);

function download(url, filepath) {
  return new Promise((resolve) => {
    if (fs.existsSync(filepath) && fs.statSync(filepath).size > 100) {
      resolve(true); // already downloaded
      return;
    }
    const req = https.get(url, { headers: { Referer: 'https://www.gamersky.com/' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filepath).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        resolve(false);
        return;
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    });
    req.on('error', () => resolve(false));
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
  });
}

async function downloadAll(concurrency = 10) {
  let completed = 0;
  let failed = 0;
  const queue = [...downloads];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      const ok = await download(item.url, item.file);
      completed++;
      if (!ok) failed++;
      if (completed % 50 === 0 || completed === downloads.length) {
        process.stdout.write(`\r  ${completed}/${downloads.length} (${failed} failed)`);
      }
    }
  }

  const workers = Array(Math.min(concurrency, queue.length)).fill().map(() => worker());
  await Promise.all(workers);
  console.log(`\nDone: ${completed - failed} ok, ${failed} failed`);
  return failed;
}

(async () => {
  const failed = await downloadAll(15);

  // Update skin paths to local
  for (const s of skins) {
    s.image_url = s._localPath;
    delete s._localFile;
    delete s._localPath;
  }

  fs.writeFileSync(__dirname + '/all_skins_seed.json', JSON.stringify(skins, null, 2));
  console.log(`Updated all_skins_seed.json with local paths`);
  console.log(`Total skins: ${skins.length}, Failed images: ${failed}`);
})();
