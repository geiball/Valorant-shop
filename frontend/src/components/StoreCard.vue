<template>
  <div
    ref="cardRef"
    class="store-card"
    :style="cardStyle"
    @click="flip"
  >
    <!-- 品质色背景（始终存在，z:0） -->
    <div class="card-bg"></div>

    <!-- 菱形网格背景（始终存在，z:1） -->
    <div class="card-diamond-grid"></div>

    <!-- 径向暗角（始终存在，z:2） -->
    <div class="card-vignette"></div>

    <!-- 未开启占位图（z:50，动画开始时淡出） -->
    <div class="card-unopened" :class="{ hide: phase !== 'idle' }">
      <img src="/assets/card_unopened_1.png" alt="?" class="unopened-img" />
    </div>

    <!-- 阶段2-3：颜色扩散层（z:10，从中心向外扩散铺满卡片） -->
    <div v-if="phase === 'spread'" class="spread-layer">
      <div class="spread-fill" :class="{ full: spreadFull }"></div>
    </div>

    <!-- 阶段3：中央菱形光效（z:11） -->
    <div v-if="phase === 'spread'" class="center-diamond" :class="{ fade: spreadFull }">
      <div class="diamond-glow"></div>
    </div>

    <!-- 阶段4：收束闪光（z:12） -->
    <div v-if="phase === 'flash'" class="flash-point"></div>

    <!-- 武器图（z:30，从reveal阶段开始显示） -->
    <div class="weapon-layer" :class="{ visible: phase === 'reveal' || phase === 'display' }">
      <img :src="skin.image_url" :alt="skin.name" class="skin-img" />
    </div>

    <!-- 信息栏（z:35） -->
    <div class="info-bar" :class="{ show: phase === 'display' }">
      <span class="skin-name">{{ skin.name }}</span><span v-if="skin.weapon !== '近战'" class="skin-weapon"> {{ skin.weapon }}</span>
      <span class="skin-popularity">{{ formatPopularity(skin.popularity) }}人想要</span>
      <span class="skin-price">
        <span class="rarity-dot" :style="{ background: rarityColor }"></span>
        {{ skin.price }}
      </span>
    </div>

    <!-- 品质角标（z:40） -->
    <div class="rarity-badge" :class="{ show: phase === 'display' }" :style="badgeStyle">
      {{ rarityLabel }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps({
  skin: { type: Object, default: () => ({}) },
  generation: { type: Number, default: 0 },
});

const RARITY_MAP = {
  select:    { label: '精选',    color: '#5b9cf5', bg: 'linear-gradient(135deg, #0d1a2e, #0a1420)' },
  deluxe:    { label: '豪华',    color: '#4ae07a', bg: 'linear-gradient(135deg, #0d2a1a, #0a1d10)' },
  premium:   { label: '尊爵',    color: '#b07cf5', bg: 'linear-gradient(135deg, #1a0d2e, #100a20)' },
  exclusive: { label: '限定',    color: '#f5a54a', bg: 'linear-gradient(135deg, #2e1a0d, #1f100a)' },
  ultra:     { label: '究極',    color: '#f5de4a', bg: 'linear-gradient(135deg, #2e2a0d, #1f1808)' },
};

const rarityInfo = computed(() => RARITY_MAP[props.skin.rarity] || RARITY_MAP.select);
const rarityLabel = computed(() => rarityInfo.value.label);
const rarityColor = computed(() => rarityInfo.value.color);

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const badgeStyle = computed(() => ({
  background: hexToRgba(rarityInfo.value.color, 0.15),
  borderColor: hexToRgba(rarityInfo.value.color, 0.4),
  color: rarityInfo.value.color,
}));

function getRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

const rgb = computed(() => getRgb(rarityInfo.value.color));

const cardStyle = computed(() => ({
  '--q-color': rarityInfo.value.color,
  '--q-r': rgb.value.r,
  '--q-g': rgb.value.g,
  '--q-b': rgb.value.b,
  background: rarityInfo.value.bg,
}));

function formatPopularity(n) {
  if (!n) return '0';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}

// ---- state machine ----
// idle → spread → flash → reveal → display
const phase = ref('idle');
const spreadFull = ref(false);
const isAnimating = ref(false);
const cardRef = ref(null);

let timers = [];

function flip() {
  if (isAnimating.value || !props.skin.id) return;
  isAnimating.value = true;
  spreadFull.value = false;

  // 阶段2：颜色从中心向外扩散 (~1200ms)
  phase.value = 'spread';
  timers.push(setTimeout(() => {
    spreadFull.value = true;
  }, 800));

  // 阶段3：收束闪光 (~300ms)
  timers.push(setTimeout(() => {
    phase.value = 'flash';
  }, 1200));

  // 阶段4：武器图淡入
  timers.push(setTimeout(() => {
    phase.value = 'reveal';
  }, 1400));

  // 阶段5：信息栏滑入
  timers.push(setTimeout(() => {
    phase.value = 'display';
    isAnimating.value = false;
  }, 1800));
}

function resetCard() {
  timers.forEach(clearTimeout);
  timers = [];
  cardRef.value?.classList.add('no-transition');
  phase.value = 'idle';
  spreadFull.value = false;
  isAnimating.value = false;

  requestAnimationFrame(() => {
    cardRef.value?.classList.remove('no-transition');
  });
}

watch(() => props.skin.image_url, (url) => {
  if (url) { const img = new Image(); img.src = url; }
}, { immediate: true });

watch(() => props.generation, () => {
  resetCard();
});

onUnmounted(() => {
  timers.forEach(clearTimeout);
});
</script>

<style scoped>
.store-card {
  position: relative;
  width: 100%;
  padding-bottom: 32.8%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 10px;
}

/* ---- reset helper ---- */
.store-card.no-transition *,
.store-card.no-transition *::before,
.store-card.no-transition *::after {
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
}

/* ---- background layers ---- */
.card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: inherit;
}

.card-diamond-grid {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image:
    repeating-linear-gradient(60deg,
      transparent, transparent 14px,
      rgba(255,255,255,0.025) 14px, rgba(255,255,255,0.025) 15px),
    repeating-linear-gradient(-60deg,
      transparent, transparent 14px,
      rgba(255,255,255,0.025) 14px, rgba(255,255,255,0.025) 15px);
  pointer-events: none;
}

.card-vignette {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
}

/* ---- unopened image ---- */
.card-unopened {
  position: absolute;
  inset: 0;
  z-index: 50;
  transition: opacity 0.2s ease-out;
}

.card-unopened.hide {
  opacity: 0;
  pointer-events: none;
}

.unopened-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ---- 阶段2-3：颜色扩散层 ---- */
.spread-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.spread-fill {
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(var(--q-r), var(--q-g), var(--q-b), 0.9) 0%,
    rgba(var(--q-r), var(--q-g), var(--q-b), 0.6) 60%,
    rgba(var(--q-r), var(--q-g), var(--q-b), 0.3) 100%
  );
  box-shadow:
    0 0 60px rgba(var(--q-r), var(--q-g), var(--q-b), 0.5),
    0 0 120px rgba(var(--q-r), var(--q-g), var(--q-b), 0.3);
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.spread-fill.full {
  width: 180%;
  height: 180%;
}

/* ---- 阶段2-3：中央发光菱形 ---- */
.center-diamond {
  position: absolute;
  inset: 0;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}

.center-diamond.fade {
  opacity: 0;
}

.diamond-glow {
  width: 40px;
  height: 40px;
  transform: rotate(45deg);
  border: 1.5px solid var(--q-color);
  background: rgba(var(--q-r), var(--q-g), var(--q-b), 0.08);
  box-shadow:
    0 0 16px rgba(var(--q-r), var(--q-g), var(--q-b), 0.7),
    0 0 40px rgba(var(--q-r), var(--q-g), var(--q-b), 0.35),
    inset 0 0 12px rgba(var(--q-r), var(--q-g), var(--q-b), 0.1);
  animation: diamondPulse 0.6s ease-in-out infinite alternate;
}

@keyframes diamondPulse {
  0%   { box-shadow: 0 0 12px rgba(var(--q-r), var(--q-g), var(--q-b), 0.5), 0 0 30px rgba(var(--q-r), var(--q-g), var(--q-b), 0.25); }
  100% { box-shadow: 0 0 22px rgba(var(--q-r), var(--q-g), var(--q-b), 0.9), 0 0 55px rgba(var(--q-r), var(--q-g), var(--q-b), 0.45); }
}

/* ---- 阶段4：收束闪光 ---- */
.flash-point {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow:
    0 0 20px 4px rgba(255,255,255,0.9),
    0 0 60px 12px rgba(var(--q-r), var(--q-g), var(--q-b), 0.7),
    0 0 100px 30px rgba(var(--q-r), var(--q-g), var(--q-b), 0.3);
  transform: translate(-50%, -50%);
  z-index: 12;
  pointer-events: none;
  animation: flashBurst 0.3s ease-out both;
}

@keyframes flashBurst {
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
  40%  { transform: translate(-50%, -50%) scale(1.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

/* ---- weapon layer ---- */
.weapon-layer {
  position: absolute;
  inset: 0;
  z-index: 30;
  opacity: 0;
  transform: scale(0.9);
  transition:
    opacity 0.3s ease-out 0.05s,
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.weapon-layer.visible {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.skin-img {
  width: 100%;
  height: calc(100% - 32px);
  object-fit: contain;
  display: block;
}

/* ---- info bar ---- */
.info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 35;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 13px;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.info-bar.show {
  transform: translateY(0);
  pointer-events: auto;
}

.skin-name { font-weight: bold; }
.skin-weapon { color: #fff; font-weight: 400; margin-left: 0.5em; }
.skin-popularity { flex: 1; text-align: center; color: #aaa; font-size: 11px; }
.skin-price {
  flex: 1;
  text-align: right;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.rarity-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
}

/* ---- rarity badge (right top) ---- */
.rarity-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 40;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  border: 1px solid transparent;
  opacity: 0;
  transform: translateY(-14px);
  transition:
    opacity 0.25s ease-out,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.rarity-badge.show {
  opacity: 1;
  transform: translateY(0);
}
</style>
