<template>
  <div class="top-nav">
    <span class="nav-item active">商店</span>
    <span class="nav-item">VCT 商店</span>
    <span class="nav-item">战斗通行证</span>
    <span class="nav-item">掌瓦通行证</span>
  </div>
</template>

<style scoped>
.top-nav {
  display: flex;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  color: #666;
  background: #fff;
}

.nav-item.active {
  color: #ff4655;
  border-bottom: 2px solid #ff4655;
  padding-bottom: 4px;
}
</style>
