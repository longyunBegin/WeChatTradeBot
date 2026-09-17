const axios = require('axios');
const config = require('../config');

const glmClient = axios.create({
  baseURL: config.glm.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.glm.apiKey}`,
  },
});

const SYSTEM_PROMPT_A = `你是一位专业的A股分析师，擅长用简洁清晰的中文撰写A股收盘总结。
要求：
1. 语言精炼，重点突出，避免冗长
2. 对各指数走势和热门板块做简要点评，指出涨跌原因和关注点
3. 结合成交量分析市场活跃度
4. 给出明日操作建议和风险提示
5. 使用emoji让排版更清晰
6. 总字数控制在500字以内`;

const SYSTEM_PROMPT_US = `你是一位专业的美股分析师，擅长用简洁清晰的中文撰写美股隔夜行情回顾。
要求：
1. 语言精炼，重点突出，避免冗长
2. 对三大指数走势做简要点评，结合成交量分析
3. 提示对A股可能产生的影响
4. 使用emoji让排版更清晰
5. 总字数控制在400字以内`;

function formatIndices(indices) {
  return indices.map(i => `  - ${i.name}: ${i.price} (${i.changePct >= 0 ? '+' : ''}${i.changePct}%)`).join('\n');
}

function formatIndicesWithVolume(indices) {
  return indices.map(i => {
    const vol = i.amount ? ` 成交额:${i.amount}` : (i.volume ? ` 成交量:${i.volume}` : '');
    return `  - ${i.name}: ${i.price} (${i.changePct >= 0 ? '+' : ''}${i.changePct}%)${vol}`;
  }).join('\n');
}

function formatSectors(sectors) {
  return sectors.map(s => `  - ${s.name}: ${s.changePct >= 0 ? '+' : ''}${s.changePct}%`).join('\n');
}

function buildAStockPrompt(aStock, sectors, timestamp) {
  return `以下是今日A股收盘数据，请生成一份收盘总结：

【A股主要指数】
${formatIndicesWithVolume(aStock)}

【热门板块TOP5(按涨幅)】
${formatSectors(sectors)}

数据时间: ${timestamp}

请生成收盘总结，包含：1) 行情综述(含成交量分析) 2) 热门板块解读 3) 走势分析 4) 明日关注要点 5) 操作建议`;
}

function buildUSStockPrompt(usStock, timestamp) {
  return `以下是隔夜美股收盘数据，请生成一份美股行情回顾：

【美股三大指数】
${formatIndicesWithVolume(usStock)}

数据时间: ${timestamp}

请生成美股行情回顾，包含：1) 三大指数综述(含成交量分析) 2) 走势分析 3) 对今日A股可能的影响 4) 关注要点`;
}

async function generateAStockAnalysis(aStockData, sectors, timestamp) {
  if (!config.glm.apiKey || config.glm.apiKey === 'your_glm_api_key_here') {
    throw new Error('GLM_API_KEY 未配置');
  }
  const resp = await glmClient.post('/chat/completions', {
    model: config.glm.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_A },
      { role: 'user', content: buildAStockPrompt(aStockData, sectors, timestamp) },
    ],
    temperature: 0.7,
    max_tokens: 700,
  });
  return resp.data.choices[0].message.content;
}

async function generateUSStockAnalysis(usStockData, timestamp) {
  if (!config.glm.apiKey || config.glm.apiKey === 'your_glm_api_key_here') {
    throw new Error('GLM_API_KEY 未配置');
  }
  const resp = await glmClient.post('/chat/completions', {
    model: config.glm.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_US },
      { role: 'user', content: buildUSStockPrompt(usStockData, timestamp) },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });
  return resp.data.choices[0].message.content;
}

async function testConnection() {
  if (!config.glm.apiKey || config.glm.apiKey === 'your_glm_api_key_here') {
    return false;
  }
  try {
    const resp = await glmClient.post('/chat/completions', {
      model: config.glm.model,
      messages: [{ role: 'user', content: '你好' }],
      max_tokens: 10,
    });
    return !!resp.data.choices;
  } catch {
    return false;
  }
}

module.exports = { generateAStockAnalysis, generateUSStockAnalysis, testConnection };
