import { defineStore } from 'pinia'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    records: []
  }),
  actions: {
    addRecord(record) {
      this.records.unshift({
        timestamp: new Date().toISOString(),
        ...record
      })
    }
  }
})