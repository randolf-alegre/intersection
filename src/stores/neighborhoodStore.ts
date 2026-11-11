import { ref } from 'vue'
import { defineStore } from 'pinia'
import { requestNeighborhoods, type Neighborhood } from '@/services/neighborhoodService'

export const useNeighborhoodStore = defineStore('neighborhoodStore', () => {
  const neighborhoods = ref<Neighborhood[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadNeighborhoods(propertyId: number | string) {
    loading.value = true
    error.value = null

    try {
      const result = await requestNeighborhoods(propertyId)
      if (!result.ok) {
        neighborhoods.value = []
        error.value = result.error.message
        return
      }

      neighborhoods.value = result.neighborhoods
    } finally {
      loading.value = false
    }
  }

  return {
    neighborhoods,
    loading,
    error,
    loadNeighborhoods,
  }
})
