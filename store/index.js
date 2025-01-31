import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    records: LocalStorage.getItem('game-history') || []
  }),
  actions: {
    addRecord(record) {
      this.gameHistory.push(record)
      LocalStorage.set('game-history', this.records)
    }
  }
})

export const useGameStore = defineStore('game', {
  state: () => ({
    gameHistory: []
  }),
  actions: {
    addHistory(record) {
      this.gameHistory.push(record)
    }
  }
})