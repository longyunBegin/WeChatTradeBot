
const config = {
  wechat: {
    webhooks: (process.env.WECHAT_WEBHOOKS || '').split(',').map(s => s.trim()).filter(Boolean),
  },
  glm: {
    apiKey: process.env.GLM_API_KEY || '',
    model: process.env.GLM_MODEL || 'glm-4-flash',
    baseUrl: process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  },
  schedule: {
    aStockPushTime: process.env.A_STOCK_PUSH_TIME || '15:05',
    usStockPushTime: process.env.US_STOCK_PUSH_TIME || '10:00',
  },
  sina: {
    hqUrl: process.env.SINA_HQ_URL || 'https://hq.sinajs.cn',
  },
};

module.exports = config;
