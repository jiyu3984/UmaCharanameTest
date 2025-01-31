import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    allowContinueOnError: false,
    random30: false
  }),
  persist: true
})