const axios = require('axios');

const client = axios.create({
  baseURL: 'https://hq.sinajs.cn',
  timeout: 10000,
  headers: {
    Referer: 'https://finance.sina.com.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

async function debugFetch(label, codes) {
  console.log(`\n========== ${label} ==========`);
  try {
    const resp = await client.get(`/list=${codes}`, { responseType: 'text', transformResponse: [d => d] });
    const lines = resp.data.trim().split('\n');
    for (const line of lines) {
      console.log(line);
      const match = line.match(/var\s+hq_str_(\S+?)="(.*)";/);
      if (match) {
        const fields = match[2].split(',');
        console.log(`  -> 字段数: ${fields.length}`);
        fields.forEach((f, i) => console.log(`     [${i}] = ${f}`));
      }
    }
  } catch (err) {
    console.error(`获取失败: ${err.message}`);
  }
}

async function main() {
  await debugFetch('A股', 'sh000001,sz399001,sz399006,sh000300');
  await debugFetch('美股', 'gb_dji,gb_ixic,gb_inx');
}

main();
