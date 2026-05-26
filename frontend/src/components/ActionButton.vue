<template>
  <div class="action-area">
    <button class="action-btn" @click="$emit('open')" :disabled="loading">
      {{ loading ? '抽取中...' : revealed ? '再开一次' : '开启每日商店' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  revealed: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

defineEmits(['open']);
</script>

<style scoped>
.action-area {
  text-align: center;
  padding: 16px 0;
}

.action-btn {
  background: linear-gradient(135deg, #ff4655, #ff6b7a);
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
  cursor: pointer;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
