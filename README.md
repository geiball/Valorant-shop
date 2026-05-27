# Valorant 每日商店模拟器

仿无畏契约（VALORANT）国服每日商店的卡牌揭晓动画效果。

## 功能

- 819 款皮肤（690 枪皮 + 129 刀皮），数据来源于游民星空国服
- 五阶段卡片揭示动画：待机 → 品质色扩散 → 菱形光效 → 闪光收束 → 武器展示
- 五档品质配色：精选 / 豪华 / 尊爵 / 限定 / 究極
- 每次随机展示 4 款皮肤，点击单卡独立揭晓
- 签到天数记录，刷新累计并持久化到本地
- 实时倒计时到下一个上午 8:00（国服每日商店刷新时间）
- 翻过的卡片锁定点击，刷新后重置

## 环境要求

- Node.js 18+

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/geiball/Valorant-shop.git
cd Valorant-shop

# 2. 安装后端依赖
cd backend
npm install

# 3. 创建后端环境变量（复制并编辑）
cp .env.example .env
# 内容：DB_PATH=./store.db / PORT=3000

# 4. 安装前端依赖
cd ../frontend
npm install

# 5. 启动后端（端口 3000）
cd ../backend
node server.js

# 6. 新终端，启动前端（端口 5173）
cd ../frontend
npx vite
```

浏览器打开 `http://localhost:5173`，点击卡片即可查看揭示动画。

## 项目结构

```
├── backend/
│   ├── server.js          # Express 入口
│   ├── db.js              # SQLite 数据库初始化与种子数据
│   └── routes/store.js    # /api/store/random 接口
├── frontend/
│   ├── src/
│   │   ├── App.vue                     # 主页面
│   │   └── components/
│   │       ├── StoreCard.vue           # 卡片组件（核心动画）
│   │       ├── CountdownBar.vue        # 倒计时栏
│   │       ├── TopNav.vue              # 顶部导航
│   │       └── BottomNav.vue           # 底部导航
│   └── public/assets/
│       ├── card_unopened_1.png         # 未开启占位图
│       └── skins/skin_*.png            # 皮肤图片（819 张）
└── tool-results/
    ├── all_skins_seed.json             # 皮肤种子数据
    └── fetch-all-skins.js              # 数据抓取脚本
```

## 技术栈

- **前端**: Vue 3 (Composition API) + Vite
- **后端**: Express 5 + better-sqlite3
- **动画**: 纯 CSS/JS 状态机，无第三方动画库
- **数据**: 游民星空国服皮肤数据（819 款）
