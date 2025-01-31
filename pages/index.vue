<template>
    <div class="container">
      <h1>马批浓度测试器</h1>
      <ModeSelect />
    </div>
  </template>
  
  <script setup>
  import ModeSelect from '@/components/ModeSelect.vue'
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 2rem auto;
    text-align: center;
  }
  </style>