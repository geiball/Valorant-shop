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
