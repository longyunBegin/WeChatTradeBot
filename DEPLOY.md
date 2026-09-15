# 云服务器部署指南

## 方案一：直接部署（推荐）

### 1. 买一台轻量云服务器
腾讯云/阿里云轻量服务器，2核2G即可，约 30-50元/月

### 2. 上传项目
```bash
# 在服务器上
git clone <你的仓库地址>  # 或 scp 上传
cd WeChatTradeBot
```

### 3. 安装依赖并启动
```bash
npm install
npm start
```

### 4. 用 pm2 保持后台运行（推荐）
```bash
npm install -g pm2
pm2 start src/index.js --name trade-bot
pm2 save
pm2 startup    # 开机自启
```

---

## 方案二：Docker 部署

```bash
docker compose up -d --build
```

自动后台运行，重启自动恢复。

---

## 方案三：OpenClaw + 本项目（同台服务器）

```bash
# 1. 安装 OpenClaw（交互式AI对话）
npm install -g openclaw@latest
openclaw onboard        # 配置企业微信渠道+AI模型
openclaw gateway &      # 后台运行

# 2. 部署本项目（定时推送早报）
cd WeChatTradeBot
npm install
pm2 start src/index.js --name trade-bot
pm2 save && pm2 startup
```

- OpenClaw：群内 @AI 聊天对话
- 本项目：定时自动推送早报
- 两者独立运行，互不干扰

---

## 注意事项
- 服务器时区设为北京时间：`timedatectl set-timezone Asia/Shanghai`
- .env 中配置好 WECHAT_WEBHOOKS 和 GLM_API_KEY
- 用 pm2 或 Docker 保证进程不被杀