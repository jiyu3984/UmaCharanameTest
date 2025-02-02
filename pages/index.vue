<template>
  <div class="container">
    <h1>马批浓度测试器</h1>
    <ModeSelect />
  </div>
  <div class="link-container">
    <button onclick="window.open('https://space.bilibili.com/302598998')" class="link-btn">
      <svg width="25" height="25" fill="#0092E4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
          <g>
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path
              d="M18.223 3.086a1.25 1.25 0 0 1 0 1.768L17.08 5.996h1.17A3.75 3.75 0 0 1 22 9.747v7.5a3.75 3.75 0 0 1-3.75 3.75H5.75A3.75 3.75 0 0 1 2 17.247v-7.5a3.75 3.75 0 0 1 3.75-3.75h1.166L5.775 4.855a1.25 1.25 0 1 1 1.767-1.768l2.652 2.652c.079.079.145.165.198.257h3.213c.053-.092.12-.18.199-.258l2.651-2.652a1.25 1.25 0 0 1 1.768 0zm.027 5.42H5.75a1.25 1.25 0 0 0-1.247 1.157l-.003.094v7.5c0 .659.51 1.199 1.157 1.246l.093.004h12.5a1.25 1.25 0 0 0 1.247-1.157l.003-.093v-7.5c0-.69-.56-1.25-1.25-1.25zm-10 2.5c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25zm7.5 0c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25z">
            </path>
          </g>
        </g>
      </svg>
      作者 bilibili 主页
    </button>

    <button onclick="window.open('https://github.com/yingyingyingqwq/')" class="link-btn">
      <svg width="25" height="25" fill="#5E5E5E" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"
        viewBox="0 0 24 24" id="github">
        <path
          d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z">
        </path>
      </svg>
      作者 Github 主页
    </button>
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

.link-container {
  text-align: center;
  bottom: 5px;
  position: fixed;
  width: 100vw;
}

.link-btn {
  width: auto;
  height: auto;
  margin: 5px;
  display: inline-flex;
  place-items: center;
  background: #e3edf7;
  color: #333333;
  font-size: 0.7rem;
  font-weight: 400;
  padding: 9px;
  border-radius: 90px;
  box-shadow: 6px 6px 10px -1px rgba(0, 0, 0, 0.15),
    -6px -6px 10px -1px rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;
  transition: transform 0.5s;
}

.link-btn:hover {
  box-shadow: inset 4px 4px 6px -1px rgba(0, 0, 0, 0.2),
    inset -4px -4px 6px -1px rgba(255, 255, 255, 0.7),
    -0.5px -0.5px 0px rgba(255, 255, 255, 1),
    0.5px 0.5px 0px rgba(0, 0, 0, 0.15),
    0px 12px 10px -10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transform: translateY(0.5em);
}

.link-btn svg {
  transition: transform 0.5s;
}

.link-btn:hover svg {
  transform: scale(0.9);
  fill: #333333;
}
</style>