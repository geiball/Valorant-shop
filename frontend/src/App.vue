<template>
  <div class="app">
    <TopNav />
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
import TopNav from './components/TopNav.vue';
import CountdownBar from './components/CountdownBar.vue';
import StoreCard from './components/StoreCard.vue';
import BottomNav from './components/BottomNav.vue';

const loading = ref(false);
const cards = ref([{}, {}, {}, {}]);
const generation = ref(0);

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
