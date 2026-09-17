const axios = require('axios');
const config = require('../config');

const sinaClient = axios.create({
  baseURL: config.sina.hqUrl,
  timeout: 10000,
  headers: {
    Referer: 'https://finance.sina.com.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});

const emClient = axios.create({
  baseURL: 'https://push2.eastmoney.com',
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Referer: 'https://data.eastmoney.com',
  },
});

const A_STOCK_INDICES = [
  { code: 'sh000001', name: '上证指数' },
  { code: 'sz399001', name: '深证成指' },
  { code: 'sz399006', name: '创业板指' },
  { code: 'sh000300', name: '沪深300' },
];

const US_STOCK_INDICES = [
  { code: 'gb_dji', name: '道琼斯' },
  { code: 'gb_ixic', name: '纳斯达克' },
  { code: 'gb_inx', name: '标普500' },
];

function parseSinaResponse(text) {
  const result = {};
  const lines = text.trim().split('\n');
  for (const line of lines) {
    const match = line.match(/var\s+hq_str_(\S+?)="(.*)";/);
    if (!match) continue;
    const code = match[1];
    const content = match[2];
    if (!content) {
      result[code] = null;
      continue;
    }
    result[code] = content.split(',');
  }
  return result;
}

function parseAStock(code, fields, displayName) {
  if (!fields || fields.length < 32) return null;
  const open = parseFloat(fields[1]);
  const preClose = parseFloat(fields[2]);
  const price = parseFloat(fields[3]);
  const high = parseFloat(fields[4]);
  const low = parseFloat(fields[5]);
  const volume = parseFloat(fields[8]);
  const amount = parseFloat(fields[9]);
  const change = price - preClose;
  const changePct = preClose !== 0 ? (change / preClose) * 100 : 0;
  return {
    market: 'A股',
    code,
    name: displayName || fields[0],
    price,
    preClose,
    open,
    high,
    low,
    volume,
    amount,
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
    date: fields[30] || '',
    time: fields[31] || '',
  };
}

function parseUSStock(code, fields, displayName) {
  if (!fields || fields.length < 9) return null;
  const price = parseFloat(fields[1]);
  const changePct = parseFloat(fields[2]);
  const change = parseFloat(fields[4]);
  const preClose = parseFloat(fields[5]);
  const open = parseFloat(fields[6]);
  const low = parseFloat(fields[7]);
  const high = parseFloat(fields[8]);
  const volume = parseFloat(fields[10]);
  const dateTime = fields[3] || '';
  return {
    market: '美股',
    code,
    name: displayName || fields[0],
    price,
    preClose,
    open,
    high,
    low,
    volume,
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
    date: dateTime.split(' ')[0] || '',
    time: dateTime.split(' ')[1] || '',
  };
}

async function fetchIndices(codeList) {
  const codes = codeList.map(c => c.code).join(',');
  const url = `/list=${codes}`;
  const resp = await sinaClient.get(url, { responseType: 'text', transformResponse: [d => d] });
  return parseSinaResponse(resp.data);
}

async function getAStockData() {
  try {
    const data = await fetchIndices(A_STOCK_INDICES);
    return A_STOCK_INDICES
      .map(item => parseAStock(item.code, data[item.code], item.name))
      .filter(Boolean);
  } catch (err) {
    console.error('[stock] 获取A股数据失败:', err.message);
    return [];
  }
}

async function getUSStockData() {
  try {
    const data = await fetchIndices(US_STOCK_INDICES);
    return US_STOCK_INDICES
      .map(item => parseUSStock(item.code, data[item.code], item.name))
      .filter(Boolean);
  } catch (err) {
    console.error('[stock] 获取美股数据失败:', err.message);
    return [];
  }
}

async function getTopSectors(topN = 5) {
  try {
    const resp = await emClient.get('/api/qt/clist/get', {
      params: {
        pn: 1,
        pz: topN,
        po: 1,
        np: 1,
        fltt: 2,
        invt: 2,
        fid: 'f3',
        fs: 'm:90+t:2',
        fields: 'f2,f3,f4,f12,f14',
      },
    });
    const diff = resp.data?.data?.diff;
    if (!diff || !Array.isArray(diff)) return [];
    return diff.map(item => ({
      name: item.f14,
      code: item.f12,
      price: item.f2,
      changePct: item.f3,
      change: item.f4,
    }));
  } catch (err) {
    console.error('[stock] 获取板块数据失败:', err.message);
    return [];
  }
}

function getTimestamp() {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
}

module.exports = { getAStockData, getUSStockData, getTopSectors, getTimestamp };
