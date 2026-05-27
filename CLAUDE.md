# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm dev              # 同时启动前后端
pnpm dev:backend      # 仅启动后端 (Express on :3000)
pnpm dev:frontend     # 仅启动前端 (Vite on :5173)

# 或者在子目录直接运行
cd backend && node server.js
cd frontend && npx vite
```

## 架构概览

- **pnpm workspace** monorepo，`backend/` + `frontend/` + 根目录 `package.json`
- **后端**: Express 5 + better-sqlite3，每次启动重建数据库（`db.js` 删除旧库重新 seed）
- **数据库**: 单表 `skins`，819 条国服皮肤数据（`tool-results/all_skins_seed.json`）
- **前端**: Vue 3 Composition API + Vite，纯 CSS/JS 动画，无第三方动画库
- **API**: 仅一个端点 `GET /api/store/random`，随机返回 4 款皮肤

## 核心组件与数据流

`App.vue` 是唯一的数据源，持有 `cards`、`generation`、`streak` 状态：
- **刷新流程**: 用户点击 CountdownBar 的刷新按钮 → `App.openStore()` → 调 API 获取 4 款新皮肤 → `generation++` → `streak++` 并写入 localStorage
- `generation` 作为 prop 传入每个 `StoreCard`，变化时 `watch(generation)` 触发 `resetCard()`

`StoreCard.vue` 使用状态机驱动 5 阶段揭示动画：
- `idle → spread → flash → reveal → display`
- 通过 `setTimeout` 链推进阶段，`resetCard()` 清除所有 timer 并回到 idle
- 翻过的卡片 `flipped = true`，禁止再次点击，直到 `generation` 变化

`CountdownBar.vue` 实时计算到下一个上午 8:00 的倒计时，归零自动翻转到下一天。

## 版本标记规范

提交使用 `vX.Y.Z:` 前缀标记版本，如 `v2.1.0: real-time countdown...`。
