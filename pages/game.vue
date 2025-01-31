<template>
  <div class="game-page">
    <GameBoard :mode="mode" />
    <nuxt-link to="/" class="back-button">返回首页</nuxt-link>
  </div>
</template>

<script>
export default {
  computed: {
    mode() {
      return this.$route.query.mode || 'normal'
    }
  },
  head() {
    return {
      title: this.mode === 'normal' ? '角色模式' : '声优模式'
    }
  }
}
</script>

<style>
.game-page {
  padding: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
}
</style>