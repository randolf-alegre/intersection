import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  deleteNeighborhood,
  getAllNeighborhoods,
  requestNeighborhoods,
  type Neighborhood,
} from '@/shared/services/neighborhoodService'

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

      neighborhoods.value = result.neighborhoods.map((neighborhood) => ({
        ...neighborhood,
        propertyId: Number(propertyId),
      }))
    } finally {
      loading.value = false
    }
  }

  async function loadAllNeighborhoods() {
    loading.value = true
    error.value = null

    try {
      const result = await getAllNeighborhoods()
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

  async function removeNeighborhood(id: number) {
    const result = await deleteNeighborhood(id)
    if (result.ok) {
      neighborhoods.value = neighborhoods.value.filter((neighborhood) => neighborhood.id !== id)
    }
    return result
  }

  return {
    neighborhoods,
    loading,
    error,
    loadNeighborhoods,
    loadAllNeighborhoods,
    removeNeighborhood,
  }
})
