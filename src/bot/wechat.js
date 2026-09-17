const axios = require('axios');
const config = require('../config');

async function sendToWebhook(webhookUrl, message) {
  const resp = await axios.post(webhookUrl, {
    msgtype: 'markdown',
    markdown: {
      content: message,
    },
  }, {
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });

  if (resp.data?.errcode !== 0) {
    throw new Error(`企业微信返回错误: ${resp.data?.errmsg || JSON.stringify(resp.data)}`);
  }
}

async function sendToRooms(message) {
  const webhooks = config.wechat.webhooks;
  if (webhooks.length === 0) {
    throw new Error('未配置 Webhook (WECHAT_WEBHOOKS)');
  }

  const results = [];
  for (let i = 0; i < webhooks.length; i++) {
    const url = webhooks[i];
    try {
      await sendToWebhook(url, message);
      console.log(`[bot] 已推送到 Webhook #${i + 1}`);
      results.push({ webhook: `#${i + 1}`, success: true });
    } catch (err) {
      console.error(`[bot] 推送到 Webhook #${i + 1} 失败:`, err.message);
      results.push({ webhook: `#${i + 1}`, success: false, error: err.message });
    }
  }

  return results;
}

function isBotReady() {
  return config.wechat.webhooks.length > 0;
}

async function initBot() {
  const webhooks = config.wechat.webhooks;
  if (webhooks.length === 0) {
    throw new Error('未配置 Webhook，请在 .env 中设置 WECHAT_WEBHOOKS');
  }
  console.log(`[bot] 企业微信群机器人已配置 ${webhooks.length} 个 Webhook`);
  return true;
}

module.exports = { sendToRooms, isBotReady, initBot };
