<template>
  <div class="mode-select">
    <div class="buttons">
      <nuxt-link to="/game?mode=normal" class="mode">角色名模式</nuxt-link>
      <nuxt-link to="/game?mode=seiyuu" class="mode">声优吃模式</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModeSelect'
}
</script>

<style scoped>
.mode-select {
  text-align: center;
  margin-top: 2rem;
}

.mode {
  margin-top: 2rem;
  margin: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #8c83ff;
  color: white;
  border: none;
  border-radius: 3rem;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: .9vw;
  border: 2px solid #6f64ff;
  transition: transform .3s cubic-bezier(.175, .885, .32, 1.275), background .3s cubic-bezier(.19, 1, .22, 1);
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-decoration: none;
}

.mode:hover {
  transform: scale(.95);
  transition: transform .5s cubic-bezier(.19, 1, .22, 1), background .5s cubic-bezier(.19, 1, .22, 1);
}
</style>