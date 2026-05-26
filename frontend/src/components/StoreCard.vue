<template>
  <div class="store-card" :class="{ revealed: isRevealed }" @click="flip">
    <div class="card-inner" :style="{ transitionDelay: delay + 's' }">
      <div class="card-front">
        <img src="/assets/card_unopened_1.png" alt="?" class="card-bg" />
      </div>
      <div class="card-back">
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
      <div class="shine"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  skin: { type: Object, default: () => ({}) },
  generation: { type: Number, default: 0 },
  delay: { type: Number, default: 0 },
});

const isRevealed = ref(false);

watch(() => props.generation, () => {
  isRevealed.value = false;
});

function flip() {
  if (!isRevealed.value && props.skin.id) {
    isRevealed.value = true;
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
  position: relative;
  width: 100%;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
}

.store-card.revealed .card-inner {
  transform: rotateY(-180deg);
}

.card-front,
.card-back {
  width: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(180deg);
}

.card-bg {
  width: 100%;
  display: block;
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

/* Glow flash at center during flip */
.card-inner::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
}

.store-card.revealed .card-inner::after {
  animation: glow-flash 0.45s ease-out forwards;
}

@keyframes glow-flash {
  0% { width: 0; height: 0; opacity: 1; }
  40% { width: 120%; height: 120%; opacity: 0.7; }
  100% { width: 200%; height: 200%; opacity: 0; }
}

/* Shine sweep */
.shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: 12px;
  overflow: hidden;
  opacity: 0;
  z-index: 5;
}

.store-card.revealed .shine {
  opacity: 1;
}

.shine::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.08) 60%,
    transparent 100%
  );
  animation: shine-sweep 0.5s ease-out forwards;
}

@keyframes shine-sweep {
  from { left: -80%; }
  to { left: 120%; }
}
</style>
