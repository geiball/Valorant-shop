# 无畏契约每日商店模拟器 — 设计文档

## 概述

模拟无畏契约每日商店的"开箱"体验。用户每次点击按钮，从皮肤池中随机抽取 4 款皮肤展示。可无限次重复。

## 技术栈

- 前端：Vue 3 + Vite
- 后端：Node.js + Express
- 数据库：MySQL
- 等概率随机，所有皮肤出现概率相同

## 数据库

单表 `skins`：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT AUTO_INCREMENT PRIMARY KEY | 自增主键 |
| name | VARCHAR(100) NOT NULL | 皮肤名称，如"异彩晶棱 幻影" |
| weapon | VARCHAR(50) NOT NULL | 武器类型，如"幻影"、"狂徒" |
| price | INT NOT NULL | VP 价格 |
| rarity | ENUM('common','rare','epic','legendary') NOT NULL | 稀有度 |
| popularity | INT DEFAULT 0 | 模拟用"想要人数" |
| image_url | VARCHAR(255) NOT NULL | 皮肤图片路径 |

## API

`GET /api/store/random` — 从 skins 表随机抽取 4 条记录，返回 JSON：

```json
{
  "skins": [
    {
      "id": 1,
      "name": "异彩晶棱 幻影",
      "weapon": "幻影",
      "price": 890,
      "rarity": "rare",
      "popularity": 26000,
      "image_url": "/assets/skins/phantom_1.png"
    }
  ]
}
```

用 `ORDER BY RAND() LIMIT 4` 实现随机抽取。

## 前端组件

```
App.vue
├── TopNav.vue        — 顶部导航标签（静态展示）
├── CountdownBar.vue  — 每日商店/王国商店切换 + 倒计时方块
├── StoreCard.vue ×4  — 皮肤卡片，两种状态：
│                        revealed=false: 显示"?"占位卡片图片
│                        revealed=true:  显示皮肤图片 + 信息栏
├── ActionButton.vue  — "开启每日商店"/"再开一次"按钮
└── BottomNav.vue     — 底部五大导航（静态展示）
```

### 交互流程

1. 初始状态：4 张 StoreCard 均处于未开启状态（显示"?"占位图）
2. 用户点击"开启每日商店"按钮 → 调用 API
3. API 返回后，4 张卡片切换为已开启状态（皮肤图片 + 名称 + 人气 + 价格 + 稀有度图标）
4. 按钮文案变为"再开一次"
5. 用户可随时再次点击，重复步骤 2-4

## 素材策略

- 从参考图中裁剪的图片直接使用：未开启占位卡片背景、已开启皮肤图、导航区域、稀有度图标
- 动态内容（皮肤名、价格、人气、倒计时）由 Vue 渲染
- 皮肤图片后续存入数据库对应的 `image_url` 字段

## 目录结构

```
每日商店/
├── frontend/             # Vue 3 项目
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── components/
│   │   │   ├── TopNav.vue
│   │   │   ├── CountdownBar.vue
│   │   │   ├── StoreCard.vue
│   │   │   ├── ActionButton.vue
│   │   │   └── BottomNav.vue
│   │   └── assets/       # 静态素材
│   └── ...
├── backend/              # Express 项目
│   ├── server.js
│   ├── db.js             # MySQL 连接
│   ├── routes/
│   │   └── store.js      # /api/store/random
│   └── package.json
└── assets/               # 从参考图裁剪的素材
    ├── card_unopened_*.png
    ├── card_opened_*.png
    ├── header.png
    └── bottom_nav.png
```

## 非功能需求

- 移动端竖屏优先（参考图为 1280×2772 手机截图）
- 卡片宽高比 3:1
- 4 张卡片垂直排列，间距约 35px
- 配色以白色背景 + 深色卡片为主
