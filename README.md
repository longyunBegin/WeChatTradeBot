# 股市早报机器人

自动获取 A股/美股 行情数据 + 热门板块 + 成交量，通过 GLM-4-Flash（免费）生成 AI 解读，定时推送到**企业微信群**。

## 推送规则

| 报告 | 推送时间 | 条件 |
|------|---------|------|
| A股收盘报告 | 每交易日 15:05 | 仅交易日 |
| 美股隔夜行情 | 每天 10:00 | 每天 |

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 获取企业微信群机器人 Webhook
1. 打开企业微信，进入目标群聊
2. 群设置 → 群机器人 → 添加机器人
3. 复制 Webhook 地址（格式：`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx`）

### 3. 配置
```bash
cp .env.example .env
```
编辑 `.env`：
```
WECHAT_WEBHOOKS=你的Webhook地址    # 多个用逗号分隔
GLM_API_KEY=你的智谱APIKey          # https://open.bigmodel.cn/ 申请
```

### 4. 启动
```bash
npm start
```

### 手动推送测试
```bash
npm run push-a      # 立即推送A股报告
npm run push-us     # 立即推送美股报告
```

## 测试
```bash
npm run test-data      # 测试数据获取(板块+成交量)
npm run test-report    # 测试报告生成(含AI解读)
```

## 项目结构
```
src/
├── index.js              # 入口
├── config/index.js       # 配置
├── bot/wechat.js         # 企业微信Webhook推送
├── data/
│   ├── stock.js          # 股市数据(新浪+东方财富)
│   └── calendar.js       # 交易日历
├── ai/glm.js             # GLM-4-Flash 调用
├── report/generator.js   # 报告生成(A股/美股)
├── scheduler/cron.js     # 两个定时任务
└── scripts/              # 测试脚本
```

## 技术栈
- **企业微信群机器人 Webhook**: 消息推送（免费、不会被风控）
- **智谱 GLM-4-Flash**: AI 内容生成（免费模型）
- **新浪财经 + 东方财富**: 行情和板块数据
- **node-schedule**: 定时任务

## 注意事项
- 企业微信群机器人是微信官方功能，不会被风控封号
- 交易日历已内置 2024-2026 节假日数据
- AI 生成内容仅供参考，不构成投资建议
