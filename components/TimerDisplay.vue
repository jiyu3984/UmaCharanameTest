<template>
  <div class="timer">
    {{ formattedTime }}
  </div>
</template>

<script>
export default {
  props: {
    startTime: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      currentTime: Date.now()
    }
  },
  computed: {
    elapsedTime() {
      return this.currentTime - this.startTime
    },
    formattedTime() {
      const totalSeconds = Math.floor(this.elapsedTime / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.currentTime = Date.now()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
</script>

<style scoped>
.timer {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>