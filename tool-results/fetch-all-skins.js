const https = require('https');
const fs = require('fs');

function fetchPage(pageIndex) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      pageIndex, pageSize: 100,
      weaponName: '全部', skinRarity: [], skinSort: 0, keyword: '',
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

(async () => {
  const allSkins = [];
  const totalPages = 17; // 1633 / 100 = ~17

  for (let i = 1; i <= totalPages; i++) {
    const result = await fetchPage(i);
    allSkins.push(...result.skinList);
    console.log(`Page ${i}: got ${result.skinList.length}, total collected: ${allSkins.length}`);
  }

  // Filter for gun skins with prices
  // weaponType: 1=手枪, 2=冲锋枪, 3=步枪, 4=狙击枪, 5=近战, 6=霰弹枪, 7=机枪, 8=挂饰/卡面
  const gunTypes = [1, 2, 3, 4, 6, 7]; // exclude melee(5) and accessories(8)

  const priced = allSkins.filter(s => {
    const price = s.priceInChianMainland || s.price;
    return price > 0 && gunTypes.includes(s.weaponType);
  });

  console.log(`\nGun skins with prices: ${priced.length}`);

  // Group by skinRarity and show distribution
  const byRarity = {};
  for (const s of priced) {
    const r = s.skinRarity;
    if (!byRarity[r]) byRarity[r] = [];
    byRarity[r].push(s);
  }

  for (const [r, skins] of Object.entries(byRarity)) {
    console.log(`\nRarity ${r} (${skins[0]?.skinRarityDescription}): ${skins.length} skins`);
    // Show top 5 by score * ownersCount
    skins.sort((a, b) => (b.score * b.ownersCount) - (a.score * a.ownersCount));
    for (const s of skins.slice(0, 5)) {
      console.log(`  ${s.name_SC} | ${s.weaponName_SC} | ¥${(s.priceInChianMainland || s.price)/100} | score:${s.score?.toFixed(1)} | owners:${s.ownersCount} | rarity:${s.skinRarityDescription}`);
      console.log(`    img: ${s.picUrl}`);
    }
  }

  // Save filtered data
  fs.writeFileSync('filtered_skins.json', JSON.stringify(priced, null, 2));
  console.log(`\nSaved ${priced.length} skins to filtered_skins.json`);
})();
