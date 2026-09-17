exports.main_handler = async (event, context) => {
  console.log('[SCF-A股] 触发执行, RequestId:', context?.request_id || 'local');

  const { isTradingDay } = require('./src/data/calendar');
  const { sendToRooms } = require('./src/bot/wechat');
  const { generateAStockReport } = require('./src/report/generator');

  if (!isTradingDay()) {
    const msg = '[SCF-A股] 今日非交易日，跳过推送';
    console.log(msg);
    return { statusCode: 200, body: msg };
  }

  try {
    const report = await generateAStockReport();
    const results = await sendToRooms(report);
    const ok = results.filter(r => r.success).length;
    const msg = `[SCF-A股] 推送完成: ${ok}/${results.length} 成功`;
    console.log(msg);
    return { statusCode: 200, body: msg };
  } catch (err) {
    console.error('[SCF-A股] 推送失败:', err.message);
    return { statusCode: 500, body: `推送失败: ${err.message}` };
  }
};