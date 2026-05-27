<template>
  <div class="countdown-bar">
    <div class="tabs">
      <span class="tab active">每日商店</span>
      <span class="tab">王国商店</span>
    </div>
    <div class="countdown">
      <span class="countdown-block">{{ paddedHours }}时</span>
      <span class="countdown-block">{{ paddedMinutes }}分</span>
      <span class="countdown-block">{{ paddedSeconds }}秒</span>
      <span class="refresh-icon" @click="$emit('refresh')" :class="{ spinning: loading }">&#x21bb;</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

defineProps({
  loading: { type: Boolean, default: false },
});

defineEmits(['refresh']);

const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const paddedHours = computed(() => String(hours.value).padStart(2, '0'));
const paddedMinutes = computed(() => String(minutes.value).padStart(2, '0'));
const paddedSeconds = computed(() => String(seconds.value).padStart(2, '0'));

let timer = null;

function getNext8am() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(8, 0, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

let targetTime = null;

function updateCountdown() {
  const now = Date.now();
  let diff = targetTime - now;
  if (diff <= 0) {
    targetTime = new Date(targetTime);
    targetTime.setDate(targetTime.getDate() + 1);
    targetTime = targetTime.getTime();
    diff = targetTime - now;
  }
  hours.value = Math.floor(diff / 3600000);
  minutes.value = Math.floor((diff % 3600000) / 60000);
  seconds.value = Math.floor((diff % 60000) / 1000);
}

onMounted(() => {
  targetTime = getNext8am().getTime();
  updateCountdown();
  timer = setInterval(updateCountdown, 1000);
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

.refresh-icon {
  margin-left: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.refresh-icon:hover {
  color: #ff4655;
}

.refresh-icon.spinning {
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
