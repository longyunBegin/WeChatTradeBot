import { getAStockData, getUSStockData, getTopSectors, getTimestamp } from '../data/stock.js';
import { generateAStockAnalysis, generateUSStockAnalysis } from '../ai/glm.js';
import { getDateStr } from '../data/calendar.js';

function formatNumber(num) {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(vol) {
  if (!vol || vol === 0) return '-';
  if (vol >= 1e8) return (vol / 1e8).toFixed(2) + '亿';
  if (vol >= 1e4) return (vol / 1e4).toFixed(2) + '万';
  return vol.toString();
}

function formatAmount(amt) {
  if (!amt || amt === 0) return '-';
  if (amt >= 1e8) return (amt / 1e8).toFixed(2) + '亿';
  if (amt >= 1e4) return (amt / 1e4).toFixed(2) + '万';
  return amt.toString();
}

function formatIndexLine(idx) {
  const arrow = idx.changePct >= 0 ? '🔺' : '🔻';
  const sign = idx.changePct >= 0 ? '+' : '';
  return `${arrow} ${idx.name}: ${formatNumber(idx.price)} (${sign}${idx.changePct}%)`;
}

function formatIndexWithVolume(idx) {
  const arrow = idx.changePct >= 0 ? '🔺' : '🔻';
  const sign = idx.changePct >= 0 ? '+' : '';
  const volStr = idx.amount ? ` 成交额:${formatAmount(idx.amount)}` : (idx.volume ? ` 成交量:${formatVolume(idx.volume)}` : '');
  return `${arrow} ${idx.name}: ${formatNumber(idx.price)} (${sign}${idx.changePct}%)${volStr}`;
}

function formatMarketSection(indices) {
  if (!indices || indices.length === 0) return '  数据获取失败';
  return indices.map(formatIndexLine).join('\n');
}

function formatMarketWithVolume(indices) {
  if (!indices || indices.length === 0) return '  数据获取失败';
  return indices.map(formatIndexWithVolume).join('\n');
}

function formatSectorLine(sector) {
  const arrow = sector.changePct >= 0 ? '🔺' : '🔻';
  const sign = sector.changePct >= 0 ? '+' : '';
  return `${arrow} ${sector.name}: ${sign}${sector.changePct}%`;
}

function formatSectors(sectors) {
  if (!sectors || sectors.length === 0) return '  板块数据获取失败';
  return sectors.map(formatSectorLine).join('\n');
}

export async function generateAStockReport() {
  console.log('[report] 开始生成A股收盘报告...');

  const [aStock, sectors] = await Promise.all([
    getAStockData(),
    getTopSectors(5),
  ]);
  const timestamp = getTimestamp();

  if (aStock.length === 0) {
    throw new Error('A股数据获取失败，无法生成报告');
  }

  const today = getDateStr(new Date());
  const sections = [
    `📊 A股收盘报告 | ${today}`,
    '',
    '🇨🇳 A股主要指数',
    formatMarketWithVolume(aStock),
    '',
    '🔥 热门板块TOP5(按涨幅)',
    formatSectors(sectors),
    '',
    `⏰ 数据时间: ${timestamp}`,
  ];

  let analysis = '';
  try {
    analysis = await generateAStockAnalysis(aStock, sectors, timestamp);
  } catch (err) {
    console.error('[report] AI分析生成失败:', err.message);
    analysis = `⚠️ AI分析生成失败: ${err.message}`;
  }

  console.log('[report] A股报告生成完成');
  return [
    sections.join('\n'),
    '',
    '━━━━━━━━━━━━━━━━',
    '',
    '📝 AI 分析与解读',
    '',
    analysis,
    '',
    '⚠️ 以上内容由AI生成，仅供参考，不构成投资建议',
  ].join('\n');
}

export async function generateUSStockReport() {
  console.log('[report] 开始生成美股行情报告...');

  const usStock = await getUSStockData();
  const timestamp = getTimestamp();

  if (usStock.length === 0) {
    throw new Error('美股数据获取失败，无法生成报告');
  }

  const today = getDateStr(new Date());
  const sections = [
    `📊 美股隔夜行情 | ${today}`,
    '',
    '🇺🇸 美股三大指数',
    formatMarketWithVolume(usStock),
    '',
    `⏰ 数据时间: ${timestamp}`,
  ];

  let analysis = '';
  try {
    analysis = await generateUSStockAnalysis(usStock, timestamp);
  } catch (err) {
    console.error('[report] AI分析生成失败:', err.message);
    analysis = `⚠️ AI分析生成失败: ${err.message}`;
  }

  console.log('[report] 美股报告生成完成');
  return [
    sections.join('\n'),
    '',
    '━━━━━━━━━━━━━━━━',
    '',
    '📝 AI 分析与解读',
    '',
    analysis,
    '',
    '⚠️ 以上内容由AI生成，仅供参考，不构成投资建议',
  ].join('\n');
}
