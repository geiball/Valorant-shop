# 无畏契约每日商店模拟器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个全栈无畏契约每日商店模拟器，用户点击按钮后随机展示 4 款皮肤。

**Architecture:** Vue 3 前端通过 API 调用 Express 后端，后端从 MySQL 随机抽取 4 条皮肤记录返回。前端用卡片组件展示皮肤信息，未开启时显示 "?" 占位图。

**Tech Stack:** Vue 3 + Vite, Node.js + Express, MySQL

---

### Task 1: 初始化后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env`

- [ ] **Step 1: 创建 package.json 并安装依赖**

```bash
cd "C:/c语言作业/前端/每日商店"
mkdir -p backend
cd backend
npm init -y
npm install express mysql2 cors dotenv
```

- [ ] **Step 2: 创建 .env 配置文件**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=valorant_store
PORT=3000
```

- [ ] **Step 3: 创建 .gitignore，.env 不提交**

```bash
echo "node_modules/
.env" > "C:/c语言作业/前端/每日商店/backend/.gitignore"
```

- [ ] **Step 4: 提交**

```bash
cd "C:/c语言作业/前端/每日商店"
git add backend/package.json backend/package-lock.json backend/.gitignore
git commit -m "feat: scaffold backend project with Express + MySQL dependencies"
```

---

### Task 2: 创建 MySQL 数据库连接

**Files:**
- Create: `backend/db.js`

- [ ] **Step 1: 编写数据库连接模块**

```js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
```

- [ ] **Step 2: 提交**

```bash
git add backend/db.js
git commit -m "feat: add MySQL connection pool module"
```

---

### Task 3: 创建数据库和 skins 表，插入种子数据

**Files:**
- Create: `backend/schema.sql`
- Create: `backend/seed.sql`

- [ ] **Step 1: 编写建表 SQL**

```sql
CREATE DATABASE IF NOT EXISTS valorant_store
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE valorant_store;

CREATE TABLE IF NOT EXISTS skins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  weapon VARCHAR(50) NOT NULL,
  price INT NOT NULL,
  rarity ENUM('common','rare','epic','legendary') NOT NULL DEFAULT 'common',
  popularity INT DEFAULT 0,
  image_url VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- [ ] **Step 2: 编写种子数据 SQL（先写入参考图中 4 款作为初始数据，后续可添加更多）**

```sql
USE valorant_store;

INSERT INTO skins (name, weapon, price, rarity, popularity, image_url) VALUES
('异彩晶棱 幻影', '幻影', 890, 'rare', 26000, '/assets/skins/card_opened_1.png'),
('盖世英雄 鬼魅', '鬼魅', 1290, 'epic', 146000, '/assets/skins/card_opened_2.png'),
('无人之境 狂徒', '狂徒', 1290, 'epic', 34000, '/assets/skins/card_opened_3.png'),
('无人之境 鬼魅', '鬼魅', 1290, 'epic', 16000, '/assets/skins/card_opened_4.png');
```

- [ ] **Step 3: 执行 SQL**

```bash
mysql -u root < "C:/c语言作业/前端/每日商店/backend/schema.sql"
mysql -u root < "C:/c语言作业/前端/每日商店/backend/seed.sql"
```

- [ ] **Step 4: 提交**

```bash
git add backend/schema.sql backend/seed.sql
git commit -m "feat: add skins table schema and initial seed data"
```

---

### Task 4: 创建随机商店 API

**Files:**
- Create: `backend/routes/store.js`

- [ ] **Step 1: 编写路由**

```js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM skins ORDER BY RAND() LIMIT 4'
    );
    res.json({ skins: rows });
  } catch (err) {
    console.error('Failed to fetch random skins:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
```

- [ ] **Step 2: 提交**

```bash
git add backend/routes/store.js
git commit -m "feat: add GET /api/store/random endpoint"
```

---

### Task 5: 创建 Express 入口文件

**Files:**
- Create: `backend/server.js`

- [ ] **Step 1: 编写 server.js**

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const storeRouter = require('./routes/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/store', storeRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: 启动服务器验证**

```bash
cd "C:/c语言作业/前端/每日商店/backend"
node server.js
```

Expected: `Server running on http://localhost:3000`

- [ ] **Step 3: 验证 API**

```bash
curl http://localhost:3000/api/store/random
```

Expected: JSON with 4 random skins.

- [ ] **Step 4: 提交**

```bash
git add backend/server.js
git commit -m "feat: add Express server entry point"
```

---

### Task 6: 初始化 Vue 3 前端项目

**Files:**
- Create: `frontend/` (Vite scaffold)

- [ ] **Step 1: 用 Vite 创建 Vue 3 项目**

```bash
cd "C:/c语言作业/前端/每日商店"
npm create vite@latest frontend -- --template vue
cd frontend
npm install
npm install axios
```

- [ ] **Step 2: 清理脚手架默认文件**

删除 `frontend/src/components/HelloWorld.vue`、`frontend/src/assets/vue.svg`。

- [ ] **Step 3: 复制素材到 public 目录**

```bash
mkdir -p "C:/c语言作业/前端/每日商店/frontend/public/assets"
cp "C:/c语言作业/前端/每日商店/assets/card_unopened_1.png" "C:/c语言作业/前端/每日商店/frontend/public/assets/"
cp "C:/c语言作业/前端/每日商店/assets/card_opened_1.png" "C:/c语言作业/前端/每日商店/frontend/public/assets/skins/"
cp "C:/c语言作业/前端/每日商店/assets/card_opened_2.png" "C:/c语言作业/前端/每日商店/frontend/public/assets/skins/"
cp "C:/c语言作业/前端/每日商店/assets/card_opened_3.png" "C:/c语言作业/前端/每日商店/frontend/public/assets/skins/"
cp "C:/c语言作业/前端/每日商店/assets/card_opened_4.png" "C:/c语言作业/前端/每日商店/frontend/public/assets/skins/"
```

- [ ] **Step 4: 提交**

```bash
cd "C:/c语言作业/前端/每日商店"
git add frontend/
git commit -m "feat: scaffold Vue 3 + Vite frontend project"
```

---

### Task 7: 创建 StoreCard 组件

**Files:**
- Create: `frontend/src/components/StoreCard.vue`

- [ ] **Step 1: 编写 StoreCard.vue**

```vue
<template>
  <div class="store-card" :class="{ revealed }">
    <img
      v-if="!revealed"
      src="/assets/card_unopened_1.png"
      alt="未开启"
      class="card-bg"
    />
    <div v-else class="card-revealed">
      <img :src="skin.image_url" :alt="skin.name" class="skin-img" />
      <div class="card-info">
        <span class="skin-name">{{ skin.name }}</span>
        <span class="skin-popularity">{{ formatPopularity(skin.popularity) }}人想要</span>
        <span class="skin-price">
          <span class="rarity-icon" :class="skin.rarity"></span>
          {{ skin.price }} VP
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  revealed: { type: Boolean, default: false },
  skin: { type: Object, default: () => ({}) },
});

function formatPopularity(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}
</script>

<style scoped>
.store-card {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.card-bg {
  width: 100%;
  display: block;
}

.card-revealed {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e, #0d1b3e);
  border-radius: 12px;
  overflow: hidden;
}

.skin-img {
  width: 100%;
  display: block;
}

.card-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
}

.skin-name {
  flex: 1;
  font-weight: bold;
}

.skin-popularity {
  flex: 1;
  text-align: center;
  color: #aaa;
  font-size: 11px;
}

.skin-price {
  flex: 1;
  text-align: right;
  font-weight: bold;
}

.rarity-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
  vertical-align: middle;
}

.rarity-icon.rare {
  background: #2ecc71;
  transform: rotate(45deg);
}

.rarity-icon.epic {
  width: 0;
  height: 0;
  background: transparent;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 12px solid #9b59b6;
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add frontend/src/components/StoreCard.vue
git commit -m "feat: add StoreCard component with revealed/unrevealed states"
```

---

### Task 8: 创建 TopNav、CountdownBar、ActionButton、BottomNav 组件

**Files:**
- Create: `frontend/src/components/TopNav.vue`
- Create: `frontend/src/components/CountdownBar.vue`
- Create: `frontend/src/components/ActionButton.vue`
- Create: `frontend/src/components/BottomNav.vue`

- [ ] **Step 1: 编写 TopNav.vue**

```vue
<template>
  <div class="top-nav">
    <span class="nav-item active">商店</span>
    <span class="nav-item">VCT 商店</span>
    <span class="nav-item">战斗通行证</span>
    <span class="nav-item">掌瓦通行证</span>
  </div>
</template>

<style scoped>
.top-nav {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  color: #666;
  background: #fff;
}

.nav-item.active {
  color: #ff4655;
  border-bottom: 2px solid #ff4655;
  padding-bottom: 4px;
}
</style>
```

- [ ] **Step 2: 编写 CountdownBar.vue**

```vue
<template>
  <div class="countdown-bar">
    <div class="tabs">
      <span class="tab active">每日商店</span>
      <span class="tab">王国商店</span>
    </div>
    <div class="countdown">
      <span class="countdown-block">{{ hours }}时</span>
      <span class="countdown-block">{{ minutes }}分</span>
      <span class="countdown-block">{{ seconds }}秒</span>
      <span class="refresh-icon">&#x21bb;</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const hours = ref(15);
const minutes = ref(56);
const seconds = ref(0);

let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    seconds.value--;
    if (seconds.value < 0) {
      seconds.value = 59;
      minutes.value--;
    }
    if (minutes.value < 0) {
      minutes.value = 59;
      hours.value--;
    }
    if (hours.value < 0) {
      hours.value = 23;
      minutes.value = 59;
      seconds.value = 59;
    }
  }, 1000);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
.countdown-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #fff;
}

.tabs { display: flex; gap: 8px; }

.tab {
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  border: 1px solid #ccc;
  color: #999;
}

.tab.active {
  border: 2px solid #333;
  color: #333;
  font-weight: bold;
}

.countdown {
  display: flex;
  gap: 3px;
  align-items: center;
  font-size: 11px;
}

.countdown-block {
  background: #1a1a2e;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
}

.refresh-icon { margin-left: 4px; font-size: 14px; }
</style>
```

- [ ] **Step 3: 编写 ActionButton.vue**

```vue
<template>
  <div class="action-area">
    <button class="action-btn" @click="$emit('open')" :disabled="loading">
      {{ loading ? '抽取中...' : revealed ? '再开一次' : '开启每日商店' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  revealed: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

defineEmits(['open']);
</script>

<style scoped>
.action-area {
  text-align: center;
  padding: 16px 0;
}

.action-btn {
  background: linear-gradient(135deg, #ff4655, #ff6b7a);
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 4: 编写 BottomNav.vue**

```vue
<template>
  <div class="bottom-nav">
    <span class="nav-icon">首页</span>
    <span class="nav-icon">好友</span>
    <span class="nav-center">+</span>
    <span class="nav-icon active">福利</span>
    <span class="nav-icon">我的</span>
  </div>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #eee;
  font-size: 10px;
  color: #999;
}

.nav-icon.active { color: #ff4655; }

.nav-center {
  background: #ff4655;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-top: -14px;
}
</style>
```

- [ ] **Step 5: 提交**

```bash
git add frontend/src/components/TopNav.vue frontend/src/components/CountdownBar.vue frontend/src/components/ActionButton.vue frontend/src/components/BottomNav.vue
git commit -m "feat: add TopNav, CountdownBar, ActionButton, BottomNav components"
```

---

### Task 9: 编写 App.vue 整合所有组件

**Files:**
- Modify: `frontend/src/App.vue`
- Modify: `frontend/src/main.js`

- [ ] **Step 1: 编写 App.vue**

```vue
<template>
  <div class="app">
    <TopNav />
    <CountdownBar />
    <div class="cards-container">
      <StoreCard
        v-for="(skin, i) in skins"
        :key="i"
        :revealed="revealed"
        :skin="skin"
      />
    </div>
    <ActionButton
      :revealed="revealed"
      :loading="loading"
      @open="openStore"
    />
    <BottomNav />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import TopNav from './components/TopNav.vue';
import CountdownBar from './components/CountdownBar.vue';
import StoreCard from './components/StoreCard.vue';
import ActionButton from './components/ActionButton.vue';
import BottomNav from './components/BottomNav.vue';

const revealed = ref(false);
const loading = ref(false);
const skins = ref([]);

async function openStore() {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/store/random');
    skins.value = res.data.skins;
    revealed.value = true;
  } catch (err) {
    console.error('Failed to fetch store:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.app {
  max-width: 420px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.cards-container {
  padding: 8px 14px;
}
</style>
```

- [ ] **Step 2: 确保 main.js 正确挂载**

```js
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/App.vue frontend/src/main.js
git commit -m "feat: wire up App.vue with all components and API integration"
```

---

### Task 10: 验证完整流程

- [ ] **Step 1: 启动后端**

```bash
cd "C:/c语言作业/前端/每日商店/backend"
node server.js
```

- [ ] **Step 2: 启动前端（新终端）**

```bash
cd "C:/c语言作业/前端/每日商店/frontend"
npm run dev
```

- [ ] **Step 3: 浏览器验证**

打开 `http://localhost:5173`，依次验证：
1. 页面加载后显示 4 张 "?" 占位卡片
2. 按钮显示"开启每日商店"
3. 点击按钮后，卡片切换为皮肤展示
4. 按钮变为"再开一次"
5. 再次点击可重复抽取
6. 倒计时正常运行

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "chore: final integration verification"
```
