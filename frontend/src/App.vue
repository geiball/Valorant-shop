<template>
  <div class="app">
    <div class="top-bar">
      <img src="/assets/刷新次数模块.jpg" alt="" class="top-bar-img" />
      <span class="streak-num">{{ streak }}</span>
    </div>
    <CountdownBar :loading="loading" @refresh="openStore" />
    <div class="cards-container">
      <StoreCard
        v-for="(skin, i) in cards"
        :key="i"
        :skin="skin"
        :generation="generation"
      />
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import CountdownBar from './components/CountdownBar.vue';
import StoreCard from './components/StoreCard.vue';
import BottomNav from './components/BottomNav.vue';

const STREAK_KEY = 'vshop_streak';

const loading = ref(false);
const cards = ref([{}, {}, {}, {}]);
const generation = ref(0);
const streak = ref(parseInt(localStorage.getItem(STREAK_KEY) || '1', 10));

async function fetchSkins() {
  const res = await axios.get('http://localhost:3000/api/store/random');
  cards.value = res.data.skins;
}

onMounted(() => fetchSkins());

async function openStore() {
  loading.value = true;
  try {
    await fetchSkins();
    generation.value++;
    streak.value++;
    localStorage.setItem(STREAK_KEY, streak.value);
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

.top-bar {
  position: relative;
  width: 100%;
  background: #1a1a2e;
}

.top-bar-img {
  width: 100%;
  display: block;
}

.streak-num {
  position: absolute;
  left: 81.25%;
  top: calc(14.8% + 10px);
  transform: translate(-50%, -50%);
  color: #222;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

.cards-container {
  padding: 8px 14px;
}
</style>
