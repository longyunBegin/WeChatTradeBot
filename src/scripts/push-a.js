require('dotenv/config');
const { isTradingDay } = require('../data/calendar');
const { generateAStockReport } = require('../report/generator');
const { sendToRooms } = require('../bot/wechat');

async function main() {
  if (!isTradingDay()) {
    console.log('[push-a] 今日非交易日，跳过');
    return;
  }
  console.log('[push-a] 开始推送A股报告...');
  const report = await generateAStockReport();
  const results = await sendToRooms(report);
  const ok = results.filter(r => r.success).length;
  console.log(`[push-a] 推送完成: ${ok}/${results.length} 成功`);
}

main().catch(err => {
  console.error('[push-a] 失败:', err.message);
  process.exit(1);
});
