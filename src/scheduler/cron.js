const schedule = require('node-schedule');
const config = require('../config');
const { isTradingDay } = require('../data/calendar');
const { sendToRooms, isBotReady } = require('../bot/wechat');
const { generateAStockReport, generateUSStockReport } = require('../report/generator');

let aStockJob = null;
let usStockJob = null;

async function runAStockPush() {
  console.log('[scheduler] 执行A股收盘推送...');

  if (!isBotReady()) {
    console.warn('[scheduler] 机器人未就绪，跳过');
    return;
  }
  if (!isTradingDay()) {
    console.log('[scheduler] 今日非交易日，跳过A股推送');
    return;
  }

  try {
    const report = await generateAStockReport();
    const results = await sendToRooms(report);
    const ok = results.filter(r => r.success).length;
    console.log(`[scheduler] A股推送完成: ${ok}/${results.length} 个群成功`);
  } catch (err) {
    console.error('[scheduler] A股推送失败:', err.message);
  }
}

async function runUSStockPush() {
  console.log('[scheduler] 执行美股行情推送...');

  if (!isBotReady()) {
    console.warn('[scheduler] 机器人未就绪，跳过');
    return;
  }

  try {
    const report = await generateUSStockReport();
    const results = await sendToRooms(report);
    const ok = results.filter(r => r.success).length;
    console.log(`[scheduler] 美股推送完成: ${ok}/${results.length} 个群成功`);
  } catch (err) {
    console.error('[scheduler] 美股推送失败:', err.message);
  }
}

function parseTime(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

function startScheduler() {
  const aTime = parseTime(config.schedule.aStockPushTime);
  const usTime = parseTime(config.schedule.usStockPushTime);

  const aRule = new schedule.RecurrenceRule();
  aRule.hour = aTime.hour;
  aRule.minute = aTime.minute;
  aRule.second = 0;
  aStockJob = schedule.scheduleJob(aRule, runAStockPush);

  const usRule = new schedule.RecurrenceRule();
  usRule.hour = usTime.hour;
  usRule.minute = usTime.minute;
  usRule.second = 0;
  usStockJob = schedule.scheduleJob(usRule, runUSStockPush);

  console.log(`[scheduler] A股推送: 每交易日 ${config.schedule.aStockPushTime}`);
  console.log(`[scheduler] 美股推送: 每天 ${config.schedule.usStockPushTime}`);
}

function stopScheduler() {
  if (aStockJob) aStockJob.cancel();
  if (usStockJob) usStockJob.cancel();
  aStockJob = null;
  usStockJob = null;
  console.log('[scheduler] 定时任务已停止');
}

module.exports = { startScheduler, stopScheduler, runAStockPush, runUSStockPush };
