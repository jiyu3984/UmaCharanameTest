import { characterSchema } from '@/assets/data/schema'
import charactersData from '@/assets/data/characters.json'

export default defineNuxtPlugin((nuxtApp) => {
  // 防止重复初始化
  if (process.client && window.__dataLoader) return
  if (process.server && nuxtApp.ssrContext.__dataLoader) return

  const validateData = (data, schema) => {
    return data.every(item => {
        try {
          return Object.keys(schema.properties).every(key => {
            if (schema.required.includes(key) && !item[key]) return false
            return true
          })
        } catch {
          return false
        }
      })
  }

  const dataLoader = {
    async loadCharacters() {
      try {
        const data = await charactersData
        return validateData(data, characterSchema) ? data : []
      } catch (error) {
        console.error('数据加载失败:', error)
        return []
      }
    }
  }

  // 双重保险防止重复注入
  if (!nuxtApp.$dataLoader) {
    nuxtApp.provide('dataLoader', dataLoader)
    if (process.client) window.__dataLoader = true
    if (process.server) nuxtApp.ssrContext.__dataLoader = true
  }
})