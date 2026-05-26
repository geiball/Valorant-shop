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
