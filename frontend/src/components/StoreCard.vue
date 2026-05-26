<template>
  <div class="store-card" :class="{ revealed: isRevealed }" @click="flip">
    <div class="card-inner">
      <!-- 正面：问号 -->
      <div class="card-front">
        <img src="/assets/card_unopened_1.png" alt="?" class="card-bg" />
      </div>
      <!-- 背面：品质色→正方形展开武器 -->
      <div class="card-back" :style="{ background: rarityGradient }">
        <div class="reveal-mask" :class="{ show: showReveal }">
          <img
            :src="skin.image_url"
            :alt="skin.name"
            class="skin-img"
            :class="{ show: showReveal }"
          />
        </div>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  skin: { type: Object, default: () => ({}) },
  generation: { type: Number, default: 0 },
});

const isRevealed = ref(false);
const showReveal = ref(false);

const rarityGradient = computed(() => {
  const map = {
    common: 'linear-gradient(135deg, #2a3a5e, #1a2a4e)',
    rare: 'linear-gradient(135deg, #1a4a2e, #0d3a18)',
    epic: 'linear-gradient(135deg, #3a1a5e, #2a0d4e)',
    legendary: 'linear-gradient(135deg, #5e4a1a, #3e2a0d)',
  };
  return map[props.skin.rarity] || map.common;
});

watch(() => props.generation, () => {
  isRevealed.value = false;
  showReveal.value = false;
});

function flip() {
  if (!isRevealed.value && props.skin.id) {
    isRevealed.value = true;
    setTimeout(() => {
      showReveal.value = true;
    }, 300);
  }
}

function formatPopularity(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}
</script>

<style scoped>
.store-card {
  width: 100%;
  margin-bottom: 10px;
  perspective: 1200px;
  cursor: pointer;
}

.card-inner {
  display: grid;
  width: 100%;
  transition: transform 0.5s ease;
  transform-style: preserve-3d;
}

.store-card.revealed .card-inner {
  transform: rotateY(-180deg);
}

.card-front,
.card-back {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.card-front {
  transform: rotateY(0deg);
}

.card-bg {
  width: 100%;
  display: block;
}

.card-back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
}

/* 正方形遮罩展开 */
.reveal-mask {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: inset(50% 50%);
  transition: clip-path 0.35s ease-out;
  overflow: hidden;
}

.reveal-mask.show {
  clip-path: inset(0% 0%);
}

/* 武器图片：先大后正常 */
.skin-img {
  width: 85%;
  display: block;
  transform: scale(1.35);
  transition: transform 0.45s ease-out;
  object-fit: contain;
}

.skin-img.show {
  transform: scale(1);
}

.card-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
  position: relative;
  z-index: 2;
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
