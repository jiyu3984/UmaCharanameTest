<template>
    <div class="mode-select">
      <div class="buttons">
        <nuxt-link to="/game?mode=normal" class="mode-button">角色模式</nuxt-link>
        <nuxt-link to="/game?mode=seiyuu" class="mode-button">声优吃模式</nuxt-link>
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
  
  .buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .mode-button {
    padding: 0.8rem 1.5rem;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: opacity 0.2s;
  }
  
  .mode-button:hover {
    opacity: 0.9;
  }
  </style>