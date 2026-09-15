import { initBot } from './bot/wechat.js';
import { startScheduler } from './scheduler/cron.js';
import { isTradingDay } from './data/calendar.js';
import config from './config/index.js';

async function main() {
  console.log('========================================');
  console.log('  微信股市早报机器人 启动');
  console.log('========================================');
  console.log(`A股推送: 每交易日 ${config.schedule.aStockPushTime}`);
  console.log(`美股推送: 每天 ${config.schedule.usStockPushTime}`);
  console.log(`Webhook数: ${config.wechat.webhooks.length}`);
  console.log(`AI模型: ${config.glm.model}`);
  console.log(`今日是否交易日: ${isTradingDay() ? '是' : '否'}`);
  console.log('----------------------------------------');

  try {
    await initBot();
    startScheduler();
    console.log('\n[main] 机器人已启动，等待定时推送...\n');

    process.on('SIGINT', async () => {
      console.log('\n[main] 正在关闭...');
      const { stopScheduler } = await import('./scheduler/cron.js');
      stopScheduler();
      process.exit(0);
    });
  } catch (err) {
    console.error('[main] 启动失败:', err.message);
    process.exit(1);
  }
}

main();
