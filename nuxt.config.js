export default {
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  plugins: ['~/plugins/dataLoader'],
  compatibilityDate: '2025-01-28',
  nitro: {
    static: true
  }
};