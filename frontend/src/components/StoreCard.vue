<template>
  <div class="store-card" :class="{ revealed }">
    <img
      v-if="!revealed"
      src="/assets/card_unopened_1.png"
      alt="未开启"
      class="card-bg"
    />
    <div v-else class="card-revealed">
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
</template>

<script setup>
defineProps({
  revealed: { type: Boolean, default: false },
  skin: { type: Object, default: () => ({}) },
});

function formatPopularity(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return String(n);
}
</script>

<style scoped>
.store-card {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.card-bg {
  width: 100%;
  display: block;
}

.card-revealed {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e, #0d1b3e);
  border-radius: 12px;
  overflow: hidden;
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
