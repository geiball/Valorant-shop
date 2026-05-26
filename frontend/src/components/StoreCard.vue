<template>
  <div class="store-card" :class="{ revealed }">
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
    </div>
  </div>
</template>

<script setup>
defineProps({
  revealed: { type: Boolean, default: false },
  skin: { type: Object, default: () => ({}) },
  delay: { type: Number, default: 0 },
});

function formatPopularity(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}
</script>

<style scoped>
.store-card {
  width: 100%;
  margin-bottom: 10px;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.store-card.revealed .card-inner {
  transform: rotateY(180deg);
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
</style>
