<template>
  <div class="bottom-nav">
    <span class="nav-icon">首页</span>
    <span class="nav-icon">好友</span>
    <span class="nav-center">+</span>
    <span class="nav-icon active">福利</span>
    <span class="nav-icon">我的</span>
  </div>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #eee;
  font-size: 10px;
  color: #999;
}

.nav-icon.active { color: #ff4655; }

.nav-center {
  background: #ff4655;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-top: -14px;
}
</style>
