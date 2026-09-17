require('dotenv/config');
const { generateUSStockReport } = require('../report/generator');
const { sendToRooms } = require('../bot/wechat');

async function main() {
  console.log('[push-us] 开始推送美股报告...');
  const report = await generateUSStockReport();
  const results = await sendToRooms(report);
  const ok = results.filter(r => r.success).length;
  console.log(`[push-us] 推送完成: ${ok}/${results.length} 成功`);
}

main().catch(err => {
  console.error('[push-us] 失败:', err.message);
  process.exit(1);
});
