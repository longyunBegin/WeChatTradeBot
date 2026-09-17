exports.main_handler = async (event, context) => {
  console.log('[SCF-美股] 触发执行, RequestId:', context?.request_id || 'local');

  const { sendToRooms } = require('./src/bot/wechat');
  const { generateUSStockReport } = require('./src/report/generator');

  try {
    const report = await generateUSStockReport();
    const results = await sendToRooms(report);
    const ok = results.filter(r => r.success).length;
    const msg = `[SCF-美股] 推送完成: ${ok}/${results.length} 成功`;
    console.log(msg);
    return { statusCode: 200, body: msg };
  } catch (err) {
    console.error('[SCF-美股] 推送失败:', err.message);
    return { statusCode: 500, body: `推送失败: ${err.message}` };
  }
};